import "server-only";
import { getStore } from "./data";
import type { Guide, Purchase } from "./data/schema";
import { getPaymentMode } from "./payments";
import { toMinorUnits } from "./payments/stripe";
import type { VerifiedPayment } from "./payments/types";
import { SITE } from "./site";
import { hashToken, isTokenShape, newToken } from "./tokens";

export const DOWNLOAD_TTL_DAYS = Number(process.env.DOWNLOAD_TTL_DAYS ?? 30);
export const MAX_DOWNLOADS = Number(process.env.MAX_DOWNLOADS ?? 10);
/** Test-mode purchases may only ever receive this clearly-labelled sample, never the paid file. */
export const TEST_SAMPLE_FILE = "guides/test-mode-sample.pdf";

const now = () => new Date().toISOString();

export class CheckoutError extends Error {}

export async function startCheckout(guideSlug: string, email: string): Promise<{ redirectUrl: string; purchaseId: string; mode: string }> {
  const { provider, mode, reason } = getPaymentMode();
  if (!provider) throw new CheckoutError(reason ?? "Checkout is unavailable.");
  const store = getStore();
  const guide = await store.findOne("guides", "slug", guideSlug);
  if (!guide || !guide.published) throw new CheckoutError("This guide is not available.");
  if (!guide.downloadable_file) throw new CheckoutError("This guide isn't on sale yet.");
  const purchaseId = crypto.randomUUID();
  const { redirectUrl, reference } = await provider.createCheckout({
    purchaseId, email, siteUrl: SITE.url,
    guide: { id: guide.id, slug: guide.slug, title: guide.title, price: guide.price, currency: guide.currency },
  });
  await store.insert("guide_purchases", {
    id: purchaseId, guide_id: guide.id, customer_email: email, provider: provider.id, payment_reference: reference,
    payment_status: "pending", amount: guide.price, currency: guide.currency, purchase_date: null,
    download_token_hash: null, download_count: 0, download_expires_at: null, created_at: now(), updated_at: now(),
  });
  return { redirectUrl, purchaseId, mode };
}

async function setStatus(p: Purchase, status: Purchase["payment_status"]) {
  if (p.payment_status === status) return p;
  // Never downgrade a settled purchase via a late/duplicate event.
  if (p.payment_status === "paid" && status !== "refunded") return p;
  const next: Purchase = { ...p, payment_status: status, purchase_date: ["paid", "test"].includes(status) ? p.purchase_date ?? now() : p.purchase_date, updated_at: now() };
  return getStore().update("guide_purchases", p.id, next);
}

/** Applies a provider-verified payment. Checks amount & currency against our own record. Idempotent. */
export async function applyVerifiedPayment(v: VerifiedPayment): Promise<Purchase | null> {
  const store = getStore();
  const p = await store.findOne("guide_purchases", "payment_reference", v.reference);
  if (!p) return null;
  if (v.purchaseId && v.purchaseId !== p.id) throw new Error("Payment reference mismatch");
  if (v.status === "paid") {
    if (v.currency !== p.currency.toUpperCase() || v.amountMinor !== toMinorUnits(p.amount, p.currency)) {
      console.error("Payment amount mismatch", { ref: v.reference });
      return setStatus(p, "failed");
    }
    return setStatus(p, "paid");
  }
  if (v.status === "failed") return setStatus(p, "failed");
  return p;
}

/** Test-mode only: simulate the sandbox outcome. Never produces a "paid" purchase. */
export async function completeTestPurchase(reference: string, outcome: "success" | "failure"): Promise<{ purchase: Purchase; token: string | null }> {
  const { provider } = getPaymentMode();
  if (!provider?.isTest) throw new CheckoutError("Test checkout is disabled.");
  if (!/^test_[a-f0-9]{24}$/.test(reference)) throw new CheckoutError("Invalid test reference.");
  const p = await getStore().findOne("guide_purchases", "payment_reference", reference);
  if (!p || p.provider !== "test") throw new CheckoutError("Test purchase not found.");
  if (p.payment_status !== "pending") throw new CheckoutError("This test checkout has already been completed.");
  const updated = await setStatus(p, outcome === "success" ? "test" : "failed");
  return { purchase: updated, token: outcome === "success" ? await issueDownloadToken(updated.id) : null };
}

/** Issues (or rotates) the buyer's download token. Only the hash is stored. */
export async function issueDownloadToken(purchaseId: string): Promise<string> {
  const store = getStore();
  const p = await store.get("guide_purchases", purchaseId);
  if (!p || !["paid", "test"].includes(p.payment_status)) throw new Error("Purchase is not settled");
  const token = newToken();
  await store.update("guide_purchases", p.id, {
    ...p, download_token_hash: hashToken(token), download_expires_at: new Date(Date.now() + DOWNLOAD_TTL_DAYS * 864e5).toISOString(), updated_at: now(),
  });
  return token;
}

export type DownloadAccess =
  | { ok: true; purchase: Purchase; guide: Guide; file: string; isTest: boolean; remaining: number }
  | { ok: false; reason: "invalid" | "unpaid" | "expired" | "exhausted" | "unavailable"; purchase?: Purchase; guide?: Guide };

export async function resolveDownload(token: string): Promise<DownloadAccess> {
  if (!isTokenShape(token)) return { ok: false, reason: "invalid" };
  const store = getStore();
  const purchase = await store.findOne("guide_purchases", "download_token_hash", hashToken(token));
  if (!purchase) return { ok: false, reason: "invalid" };
  const guide = (await store.get("guides", purchase.guide_id)) ?? undefined;
  if (!guide) return { ok: false, reason: "unavailable", purchase };
  if (!["paid", "test"].includes(purchase.payment_status)) return { ok: false, reason: "unpaid", purchase, guide };
  if (!purchase.download_expires_at || new Date(purchase.download_expires_at) < new Date()) return { ok: false, reason: "expired", purchase, guide };
  if (purchase.download_count >= MAX_DOWNLOADS) return { ok: false, reason: "exhausted", purchase, guide };
  const isTest = purchase.payment_status === "test";
  const file = isTest ? TEST_SAMPLE_FILE : guide.downloadable_file;
  if (!file) return { ok: false, reason: "unavailable", purchase, guide };
  return { ok: true, purchase, guide, file, isTest, remaining: MAX_DOWNLOADS - purchase.download_count };
}

export async function recordDownload(p: Purchase) {
  const fresh = await getStore().get("guide_purchases", p.id);
  if (fresh) await getStore().update("guide_purchases", p.id, { ...fresh, download_count: fresh.download_count + 1, updated_at: now() });
}

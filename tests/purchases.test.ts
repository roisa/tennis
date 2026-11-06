import { createHmac } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

// Isolated JSON store for this suite (must be set before the store is first used).
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cs-pay-"));
process.env.LOCAL_DATA_FILE = path.join(dir, "db.json");
process.env.PAYMENT_PROVIDER = "test";

const { getStore } = await import("@/lib/data");
const P = await import("@/lib/purchases");
const { StripeProvider } = await import("@/lib/payments/stripe");

let guideId = "";
const now = () => new Date().toISOString();
async function purchase(ref: string, over: Record<string, unknown> = {}) {
  const row = { id: crypto.randomUUID(), guide_id: guideId, customer_email: "b@x.com", provider: "stripe", payment_reference: ref, payment_status: "pending" as const, amount: 19, currency: "USD", purchase_date: null, download_token_hash: null, download_count: 0, download_expires_at: null, created_at: now(), updated_at: now(), ...over };
  return getStore().insert("guide_purchases", row as never);
}

beforeAll(async () => {
  guideId = (await getStore().findOne("guides", "slug", "bali-tennis-escape-guide"))!.id;
});

describe("payment settlement (server-side verification)", () => {
  it("marks paid only when amount and currency match our record", async () => {
    await purchase("cs_ok");
    await purchase("cs_bad");
    expect((await P.applyVerifiedPayment({ status: "paid", reference: "cs_ok", purchaseId: null, amountMinor: 1900, currency: "USD" }))?.payment_status).toBe("paid");
    expect((await P.applyVerifiedPayment({ status: "paid", reference: "cs_bad", purchaseId: null, amountMinor: 100, currency: "USD" }))?.payment_status).toBe("failed");
  });
  it("is idempotent and never downgrades a paid purchase", async () => {
    const p = await P.applyVerifiedPayment({ status: "failed", reference: "cs_ok", purchaseId: null });
    expect(p?.payment_status).toBe("paid");
  });
  it("rejects a reference/purchase mismatch", async () => {
    await expect(P.applyVerifiedPayment({ status: "paid", reference: "cs_ok", purchaseId: crypto.randomUUID(), amountMinor: 1900, currency: "USD" })).rejects.toThrow();
  });
  it("ignores unknown references", async () => {
    expect(await P.applyVerifiedPayment({ status: "paid", reference: "cs_unknown", purchaseId: null, amountMinor: 1900, currency: "USD" })).toBeNull();
  });
});

describe("protected downloads", () => {
  it("issues tokens only for settled purchases", async () => {
    const pending = await purchase("cs_pending");
    await expect(P.issueDownloadToken(pending.id)).rejects.toThrow();
  });
  it("paid purchases get the real file; test purchases only the sample", async () => {
    const paid = (await getStore().findOne("guide_purchases", "payment_reference", "cs_ok"))!;
    const token = await P.issueDownloadToken(paid.id);
    const a = await P.resolveDownload(token);
    expect(a.ok && a.file).toBe("guides/bali-tennis-escape-guide.pdf");

    const t = await purchase("test_" + "a".repeat(24), { provider: "test", payment_status: "test" });
    const b = await P.resolveDownload(await P.issueDownloadToken(t.id));
    expect(b.ok && b.file).toBe(P.TEST_SAMPLE_FILE);
    expect(b.ok && b.isTest).toBe(true);
  });
  it("rotating a token invalidates the old one", async () => {
    const paid = (await getStore().findOne("guide_purchases", "payment_reference", "cs_ok"))!;
    const first = await P.issueDownloadToken(paid.id);
    await P.issueDownloadToken(paid.id);
    expect((await P.resolveDownload(first)).ok).toBe(false);
  });
  it("denies expired links and exhausted download counts", async () => {
    const p = (await getStore().findOne("guide_purchases", "payment_reference", "cs_ok"))!;
    const token = await P.issueDownloadToken(p.id);
    const cur = (await getStore().get("guide_purchases", p.id))!;
    await getStore().update("guide_purchases", p.id, { ...cur, download_expires_at: new Date(Date.now() - 1000).toISOString() });
    expect(await P.resolveDownload(token)).toMatchObject({ ok: false, reason: "expired" });
    await getStore().update("guide_purchases", p.id, { ...cur, download_count: P.MAX_DOWNLOADS });
    expect(await P.resolveDownload(token)).toMatchObject({ ok: false, reason: "exhausted" });
  });
  it("denies failed purchases even with a valid-shaped token", async () => {
    expect(await P.resolveDownload("A".repeat(43))).toMatchObject({ ok: false, reason: "invalid" });
  });
});

describe("Stripe webhook parsing", () => {
  const provider = new StripeProvider("sk_test_dummy", "whsec_unit");
  const event = (type: string, obj: Record<string, unknown>) => JSON.stringify({ type, data: { object: { id: "cs_1", status: "complete", payment_status: "paid", amount_total: 1900, currency: "usd", client_reference_id: null, metadata: {}, ...obj } } });
  const headersFor = (body: string, secret = "whsec_unit") => {
    const t = Math.floor(Date.now() / 1000);
    return new Headers({ "stripe-signature": `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")}` });
  };
  it("parses a signed checkout.session.completed event", async () => {
    const body = event("checkout.session.completed", {});
    expect(await provider.parseWebhook(body, headersFor(body))).toMatchObject({ status: "paid", reference: "cs_1", amountMinor: 1900, currency: "USD" });
  });
  it("rejects forged signatures and ignores unrelated events", async () => {
    const body = event("checkout.session.completed", {});
    await expect(provider.parseWebhook(body, headersFor(body, "whsec_attacker"))).rejects.toThrow();
    const other = JSON.stringify({ type: "invoice.paid", data: { object: {} } });
    expect(await provider.parseWebhook(other, headersFor(other))).toBeNull();
  });
  it("treats unpaid sessions as pending, never paid", async () => {
    const body = event("checkout.session.completed", { payment_status: "unpaid" });
    expect((await provider.parseWebhook(body, headersFor(body)))?.status).toBe("pending");
  });
});

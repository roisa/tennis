import { createHmac, timingSafeEqual } from "node:crypto";
import { PaymentConfigError, type CheckoutInput, type PaymentProvider, type VerifiedPayment } from "./types";

const API = "https://api.stripe.com/v1";
const ZERO_DECIMAL = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);

export const toMinorUnits = (amount: number, currency: string) => (ZERO_DECIMAL.has(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100));

/** Verifies a Stripe-Signature header (scheme v1, HMAC-SHA256) with timestamp tolerance. */
export function verifyStripeSignature(payload: string, header: string | null, secret: string, toleranceSec = 300, now = Math.floor(Date.now() / 1000)): boolean {
  if (!header) return false;
  const parts = Object.groupBy(header.split(",").map((p) => p.split("=", 2) as [string, string]), ([k]) => k);
  const t = Number(parts.t?.[0]?.[1]);
  const sigs = (parts.v1 ?? []).map(([, v]) => v);
  if (!Number.isFinite(t) || !sigs.length || Math.abs(now - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest();
  return sigs.some((s) => {
    const buf = Buffer.from(s, "hex");
    return buf.length === expected.length && timingSafeEqual(buf, expected);
  });
}

type Session = { id: string; payment_status: string; status: string; amount_total: number | null; currency: string | null; client_reference_id: string | null; metadata?: Record<string, string> };

export class StripeProvider implements PaymentProvider {
  readonly id = "stripe" as const;
  readonly isTest = false;
  constructor(private readonly secretKey: string, private readonly webhookSecret?: string) {
    if (!secretKey) throw new PaymentConfigError("STRIPE_SECRET_KEY is not set");
  }

  private async call<T>(path: string, init?: { method?: string; body?: URLSearchParams }): Promise<T> {
    const res = await fetch(`${API}${path}`, {
      method: init?.method ?? "GET",
      headers: { Authorization: `Bearer ${this.secretKey}`, "Content-Type": "application/x-www-form-urlencoded", "Stripe-Version": "2024-06-20" },
      body: init?.body,
      cache: "no-store",
    });
    const json = (await res.json()) as T & { error?: { message: string } };
    if (!res.ok) throw new Error(`Stripe error: ${json.error?.message ?? res.status}`);
    return json;
  }

  async createCheckout({ purchaseId, guide, email, siteUrl }: CheckoutInput) {
    const body = new URLSearchParams({
      mode: "payment",
      customer_email: email,
      client_reference_id: purchaseId,
      "metadata[purchase_id]": purchaseId,
      "metadata[guide_id]": guide.id,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": guide.currency.toLowerCase(),
      "line_items[0][price_data][unit_amount]": String(toMinorUnits(guide.price, guide.currency)),
      "line_items[0][price_data][product_data][name]": guide.title,
      success_url: `${siteUrl}/guides/${guide.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/guides/${guide.slug}?checkout=cancelled`,
    });
    const s = await this.call<Session & { url: string }>("/checkout/sessions", { method: "POST", body });
    return { redirectUrl: s.url, reference: s.id };
  }

  private toVerified(s: Session): VerifiedPayment {
    const purchaseId = s.metadata?.purchase_id ?? s.client_reference_id ?? null;
    if (s.payment_status === "paid") return { status: "paid", reference: s.id, purchaseId, amountMinor: s.amount_total ?? 0, currency: (s.currency ?? "").toUpperCase() };
    return { status: s.status === "expired" ? "failed" : "pending", reference: s.id, purchaseId };
  }

  async verify(reference: string) {
    if (!/^cs_[A-Za-z0-9_]+$/.test(reference)) throw new Error("Invalid session reference");
    return this.toVerified(await this.call<Session>(`/checkout/sessions/${reference}`));
  }

  async parseWebhook(rawBody: string, headers: Headers) {
    if (!this.webhookSecret) throw new PaymentConfigError("STRIPE_WEBHOOK_SECRET is not set");
    if (!verifyStripeSignature(rawBody, headers.get("stripe-signature"), this.webhookSecret)) throw new Error("Invalid signature");
    const event = JSON.parse(rawBody) as { type: string; data: { object: Session } };
    if (!event.type.startsWith("checkout.session.")) return null;
    if (event.type === "checkout.session.async_payment_failed") return { status: "failed" as const, reference: event.data.object.id, purchaseId: event.data.object.client_reference_id };
    return this.toVerified(event.data.object);
  }
}

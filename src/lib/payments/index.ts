import "server-only";
import { StripeProvider } from "./stripe";
import { TestProvider } from "./test";
import type { PaymentProvider } from "./types";

export type PaymentMode = { provider: PaymentProvider | null; mode: "test" | "live" | "disabled"; reason?: string };

/**
 * Selects the payment provider from env. Default is TEST MODE.
 * PAYMENT_PROVIDER=stripe requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
 * Regional providers (e.g. Xendit, Midtrans for IDR/QRIS) can be added by implementing PaymentProvider.
 */
export function getPaymentMode(): PaymentMode {
  const choice = (process.env.PAYMENT_PROVIDER ?? "test").toLowerCase();
  if (choice === "stripe") {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return { provider: null, mode: "disabled", reason: "Stripe is selected but not fully configured." };
    return { provider: new StripeProvider(process.env.STRIPE_SECRET_KEY, process.env.STRIPE_WEBHOOK_SECRET), mode: "live" };
  }
  if (choice === "test") {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_TEST_PAYMENTS === "false") return { provider: null, mode: "disabled", reason: "Checkout is not yet open." };
    return { provider: new TestProvider(), mode: "test" };
  }
  return { provider: null, mode: "disabled", reason: `Unknown payment provider "${choice}".` };
}

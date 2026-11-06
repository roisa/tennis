export type CheckoutInput = {
  purchaseId: string;
  guide: { id: string; slug: string; title: string; price: number; currency: string };
  email: string;
  siteUrl: string;
};

export type CheckoutResult = { redirectUrl: string; reference: string };

/** Result of verifying a payment with the provider — always server-side. */
export type VerifiedPayment =
  | { status: "paid"; reference: string; purchaseId: string | null; amountMinor: number; currency: string }
  | { status: "failed" | "pending"; reference: string; purchaseId: string | null };

export interface PaymentProvider {
  readonly id: "test" | "stripe";
  /** True only for the sandbox provider. Test purchases never unlock paid files. */
  readonly isTest: boolean;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  /** Re-fetches payment state from the provider by reference (e.g. Stripe Checkout Session id). */
  verify(reference: string): Promise<VerifiedPayment>;
  /** Verifies a webhook's authenticity; returns null if the event is irrelevant. Throws on bad signature. */
  parseWebhook?(rawBody: string, headers: Headers): Promise<VerifiedPayment | null>;
}

export class PaymentConfigError extends Error {}

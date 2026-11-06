import { randomBytes } from "node:crypto";
import type { CheckoutInput, PaymentProvider } from "./types";

/**
 * TEST MODE provider. No money moves. Purchases completed here are stored with
 * payment_status "test" and can only ever download the clearly-marked sample file.
 */
export class TestProvider implements PaymentProvider {
  readonly id = "test" as const;
  readonly isTest = true;
  async createCheckout({ siteUrl }: CheckoutInput) {
    const reference = `test_${randomBytes(12).toString("hex")}`;
    return { redirectUrl: `${siteUrl}/guides/checkout/test?ref=${reference}`, reference };
  }
  async verify(reference: string) {
    return { status: "pending" as const, reference, purchaseId: null };
  }
}

import { NextResponse } from "next/server";
import { getPaymentMode } from "@/lib/payments";
import { applyVerifiedPayment } from "@/lib/purchases";

export const dynamic = "force-dynamic";

/** Stripe webhook: signature-verified; idempotent; the source of truth for payment status. */
export async function POST(req: Request) {
  const { provider } = getPaymentMode();
  if (!provider?.parseWebhook) return NextResponse.json({ error: "Webhooks not configured" }, { status: 503 });
  const raw = await req.text();
  let event;
  try {
    event = await provider.parseWebhook(raw, req.headers);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event) {
    try {
      await applyVerifiedPayment(event);
    } catch (e) {
      console.error("webhook apply failed", e);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}

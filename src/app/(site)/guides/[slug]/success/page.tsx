import Link from "next/link";
import { redirect } from "next/navigation";
import { getPaymentMode } from "@/lib/payments";
import { applyVerifiedPayment, issueDownloadToken } from "@/lib/purchases";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thank you", robots: { index: false, follow: false } };

/** Stripe return URL: payment is re-verified server-side with Stripe before any link is issued. */
export default async function SuccessPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ session_id?: string }> }) {
  const { slug } = await params;
  const { session_id } = await searchParams;
  const { provider } = getPaymentMode();
  let token: string | null = null;
  let state: "paid" | "pending" | "failed" | "error" = "error";
  if (provider && !provider.isTest && session_id) {
    try {
      const verified = await provider.verify(session_id);
      const purchase = await applyVerifiedPayment(verified);
      if (purchase?.payment_status === "paid") {
        token = await issueDownloadToken(purchase.id);
        state = "paid";
      } else state = purchase?.payment_status === "failed" ? "failed" : "pending";
    } catch (e) {
      console.error("success verification failed", e);
    }
  }
  if (token) redirect(`/downloads/${token}`);
  return (
    <section className="container-x max-w-2xl py-24">
      <h1 className="display text-[56px] text-forest">{state === "pending" ? "Payment processing." : state === "failed" ? "Payment unsuccessful." : "We couldn't confirm your payment."}</h1>
      <p className="mt-4 text-lg text-charcoal/75">
        {state === "pending" ? "Your payment hasn't settled yet. Refresh this page in a minute." : state === "failed" ? "No charge was completed. You can try again." : "If you were charged, contact us with your receipt and we'll send your download link."}
      </p>
      <div className="mt-8 flex gap-3"><Link className="btn-forest" href={`/guides/${slug}`}>Back to the guide</Link><Link className="btn-ghost-dark" href="/contact?topic=Guides">Contact us</Link></div>
    </section>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/data";
import { finishTestCheckout } from "@/lib/actions/checkout";
import { formatPrice } from "@/lib/labels";
import { getPaymentMode } from "@/lib/payments";

export const dynamic = "force-dynamic";
export const metadata = { title: "Test checkout", robots: { index: false, follow: false } };

export default async function TestCheckoutPage({ searchParams }: { searchParams: Promise<{ ref?: string; failed?: string; error?: string }> }) {
  const { ref, failed, error } = await searchParams;
  if (!getPaymentMode().provider?.isTest || !ref || !/^test_[a-f0-9]{24}$/.test(ref)) notFound();
  const purchase = await getStore().findOne("guide_purchases", "payment_reference", ref);
  if (!purchase) notFound();
  const guide = await getStore().get("guides", purchase.guide_id);
  return (
    <section className="container-x max-w-2xl py-20">
      <div className="border-2 border-dashed border-forest bg-lime/40 p-5 text-forest" role="note">
        <p className="eyebrow">Test mode — sandbox checkout</p>
        <p className="mt-2 text-[14px]">No payment provider is connected. Nothing will be charged, and a successful test purchase unlocks only a clearly-marked <strong>sample file</strong>, never the paid guide.</p>
      </div>
      <h1 className="display mt-10 text-[52px] text-forest">Checkout</h1>
      <dl className="mt-6 divide-y divide-forest/10 border-y border-forest/10 text-[15px]">
        <div className="flex justify-between py-3"><dt>Product</dt><dd className="font-semibold">{guide?.title}</dd></div>
        <div className="flex justify-between py-3"><dt>Amount</dt><dd>{formatPrice(purchase.amount, purchase.currency)} <span className="text-charcoal/50">(not charged)</span></dd></div>
        <div className="flex justify-between py-3"><dt>Email</dt><dd>{purchase.customer_email}</dd></div>
        <div className="flex justify-between py-3"><dt>Status</dt><dd data-testid="purchase-status">{purchase.payment_status}</dd></div>
      </dl>
      {error && <p role="alert" className="mt-6 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>}
      {failed ? (
        <div role="alert" className="mt-8">
          <p className="display text-[32px] text-forest">Payment failed (simulated).</p>
          <p className="mt-2 text-charcoal/70">No download was issued. You can return to the guide and try again.</p>
          <Link href={guide ? `/guides/${guide.slug}` : "/guides"} className="btn-forest mt-6">Back to the guide</Link>
        </div>
      ) : purchase.payment_status === "pending" ? (
        <form action={finishTestCheckout} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="ref" value={ref} />
          <button name="outcome" value="success" className="btn-forest flex-1">Simulate successful test payment</button>
          <button name="outcome" value="failure" className="btn-ghost-dark flex-1">Simulate failed payment</button>
        </form>
      ) : (
        <p className="mt-8 text-charcoal/70">This test checkout has already been completed.</p>
      )}
    </section>
  );
}

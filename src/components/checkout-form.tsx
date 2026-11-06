"use client";

import { useActionState } from "react";
import { beginCheckout } from "@/lib/actions/checkout";
import { track } from "@/lib/analytics";
import { keepValuesOnSubmit } from "@/lib/use-keep-values";

export function CheckoutForm({ slug, priceLabel, testMode, title }: { slug: string; priceLabel: string; testMode: boolean; title: string }) {
  const [state, action, pending] = useActionState(beginCheckout, {});
  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action, () => track("begin_checkout", { item_id: slug, item_name: title }))} className="space-y-4" noValidate>
      <input type="hidden" name="guide" value={slug} />
      <div>
        <label htmlFor="co-email" className="field-label">Email for your download link</label>
        <input id="co-email" name="email" type="email" required autoComplete="email" className="field" placeholder="you@example.com" aria-describedby="co-err" />
      </div>
      <label className="flex items-start gap-3 text-[13px] text-charcoal/75">
        <input type="checkbox" name="terms" required className="mt-1 h-4 w-4 accent-[#152D28]" />
        <span>I agree to the <a href="/terms" className="underline">terms</a> and understand this is a digital product delivered by download link.</span>
      </label>
      <p id="co-err" role="alert" className="min-h-5 text-sm text-red-800">{state.error}</p>
      <button type="submit" disabled={pending} className="btn-forest w-full">{pending ? "Starting checkout…" : `Buy now — ${priceLabel}`}</button>
      {testMode && <p className="text-center text-xs text-charcoal/60"><strong>Test mode:</strong> no payment is taken. You&rsquo;ll receive a sample file, not the full guide.</p>}
    </form>
  );
}

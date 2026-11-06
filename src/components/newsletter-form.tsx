"use client";

import { useActionState } from "react";
import { subscribe, type FormState } from "@/lib/actions/public";
import { track } from "@/lib/analytics";
import { keepValuesOnSubmit } from "@/lib/use-keep-values";

export function NewsletterForm({ source = "footer", tone = "dark" }: { source?: string; tone?: "dark" | "light" }) {
  const [state, action, pending] = useActionState(async (prev: FormState, fd: FormData) => {
    const res = await subscribe(prev, fd);
    if (res.ok) track("sign_up", { method: "newsletter", source });
    return res;
  }, { ok: false, message: "" });
  const dark = tone === "dark";
  if (state.ok) {
    return <p role="status" className={`font-display text-2xl ${dark ? "text-lime" : "text-forest"}`}>{state.message}</p>;
  }
  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="w-full" noValidate>
      <input type="hidden" name="source" value={source} />
      <div className="hidden" aria-hidden="true">
        <label>Leave empty<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label htmlFor={`nl-${source}`} className="sr-only">Email address</label>
      <div className={`flex flex-col gap-3 sm:flex-row sm:gap-0 ${dark ? "" : ""}`}>
        <input
          id={`nl-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          aria-invalid={!state.ok && Boolean(state.message) ? true : undefined}
          aria-describedby={`nl-${source}-msg`}
          className={`min-w-0 flex-1 border px-5 py-4 text-[15px] focus:outline-none ${dark ? "border-ivory/30 bg-transparent text-ivory placeholder:text-ivory/50 focus:border-lime" : "border-forest/25 bg-white text-charcoal placeholder:text-stone focus:border-forest"}`}
        />
        <button type="submit" disabled={pending} className={dark ? "btn-lime" : "btn-forest"}>
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <p id={`nl-${source}-msg`} aria-live="polite" className={`mt-3 min-h-5 text-sm ${dark ? "text-lime" : "text-red-800"}`}>{state.message}</p>
      <p className={`text-xs ${dark ? "text-ivory/50" : "text-stone"}`}>Occasional dispatches on new destinations and courts. Unsubscribe anytime. See our <a className="underline" href="/privacy">privacy policy</a>.</p>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { sendInquiry, type FormState } from "@/lib/actions/public";
import { keepValuesOnSubmit } from "@/lib/use-keep-values";

const TOPICS = ["General", "Partnerships", "Venue update", "Press", "Guides"];

export function ContactForm() {
  const params = useSearchParams();
  const topic = params.get("topic") ?? undefined;
  const venue = params.get("venue")?.slice(0, 200) ?? undefined;
  const [state, action, pending] = useActionState<FormState, FormData>(sendInquiry, { ok: false, message: "" });
  if (state.ok) return <p role="status" className="display text-[36px] text-forest">{state.message}</p>;
  const err = (k: string) => state.errors?.[k];
  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="grid gap-5" noValidate>
      <div className="hidden" aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="field-label">Name</label>
          <input id="c-name" name="name" required autoComplete="name" className="field" aria-invalid={!!err("name")} aria-describedby="c-name-e" />
          <p id="c-name-e" className="mt-1 text-sm text-red-800">{err("name")}</p>
        </div>
        <div>
          <label htmlFor="c-email" className="field-label">Email</label>
          <input id="c-email" name="email" type="email" required autoComplete="email" className="field" aria-invalid={!!err("email")} aria-describedby="c-email-e" />
          <p id="c-email-e" className="mt-1 text-sm text-red-800">{err("email")}</p>
        </div>
      </div>
      <div>
        <label htmlFor="c-topic" className="field-label">Topic</label>
        <select id="c-topic" name="topic" defaultValue={TOPICS.includes(topic ?? "") ? topic : "General"} className="field">{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
      </div>
      <div>
        <label htmlFor="c-msg" className="field-label">Message</label>
        <textarea id="c-msg" name="message" rows={7} required className="field" defaultValue={venue ? `Update for ${venue}: ` : ""} aria-invalid={!!err("message")} aria-describedby="c-msg-e" />
        <p id="c-msg-e" className="mt-1 text-sm text-red-800">{err("message")}</p>
      </div>
      <p aria-live="polite" className="text-sm text-red-800">{!state.ok && state.message}</p>
      <button type="submit" disabled={pending} className="btn-forest w-fit">{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}

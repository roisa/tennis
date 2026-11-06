"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/admin";
import { keepValuesOnSubmit } from "@/lib/use-keep-values";

export function LoginForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="space-y-5">
      <div><label htmlFor="email" className="field-label">Email</label><input id="email" name="email" type="email" autoComplete="username" required className="field" disabled={disabled} /></div>
      <div><label htmlFor="password" className="field-label">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="field" disabled={disabled} /></div>
      <p role="alert" className="min-h-5 text-sm text-red-800">{state.error}</p>
      <button type="submit" className="btn-forest w-full" disabled={pending || disabled}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

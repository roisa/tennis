"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { CheckoutError, completeTestPurchase, startCheckout } from "../purchases";
import { rateLimit } from "../rate-limit";

export type CheckoutState = { error?: string };

export async function beginCheckout(_: CheckoutState, fd: FormData): Promise<CheckoutState> {
  const email = z.string().trim().toLowerCase().email().max(254).safeParse(fd.get("email"));
  const slug = z.string().regex(/^[a-z0-9-]{2,120}$/).safeParse(fd.get("guide"));
  if (!slug.success) return { error: "Unknown guide." };
  if (!email.success) return { error: "Please enter a valid email address — we'll send your download link there." };
  if (fd.get("terms") !== "on") return { error: "Please accept the terms to continue." };
  if (!(await rateLimit("checkout", 10, 60_000))) return { error: "Too many attempts. Please wait a minute." };
  let url: string;
  try {
    url = (await startCheckout(slug.data, email.data)).redirectUrl;
  } catch (e) {
    if (e instanceof CheckoutError) return { error: e.message };
    console.error("checkout failed", e);
    return { error: "We couldn't start checkout. Please try again shortly." };
  }
  redirect(url);
}

export async function finishTestCheckout(fd: FormData) {
  const ref = String(fd.get("ref") ?? "");
  const outcome = fd.get("outcome") === "success" ? "success" : "failure";
  let target: string;
  try {
    const { token } = await completeTestPurchase(ref, outcome);
    target = token ? `/downloads/${token}` : `/guides/checkout/test?ref=${encodeURIComponent(ref)}&failed=1`;
  } catch (e) {
    target = `/guides/checkout/test?ref=${encodeURIComponent(ref)}&error=${encodeURIComponent(e instanceof CheckoutError ? e.message : "Something went wrong.")}`;
  }
  redirect(target);
}

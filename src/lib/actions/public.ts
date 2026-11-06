"use server";

import { z } from "zod";
import { getStore } from "../data";
import { StoreError } from "../data/store";
import { rateLimit } from "../rate-limit";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> };

const now = () => new Date().toISOString();

export async function subscribe(_: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("company")) return { ok: true, message: "Thank you — you're on the list." }; // honeypot
  const parsed = z.string().trim().toLowerCase().email().max(254).safeParse(fd.get("email"));
  if (!parsed.success) return { ok: false, message: "Please enter a valid email address." };
  if (!(await rateLimit("subscribe", 5, 60_000))) return { ok: false, message: "Too many attempts. Please try again in a minute." };
  const store = getStore();
  try {
    const existing = await store.findOne("subscribers", "email", parsed.data);
    if (!existing) {
      await store.insert("subscribers", {
        id: crypto.randomUUID(), email: parsed.data, source: String(fd.get("source") ?? "site").slice(0, 80), created_at: now(), updated_at: now(),
      });
    }
    return { ok: true, message: "Thank you — you're on the list." };
  } catch (e) {
    if (e instanceof StoreError && e.code === "conflict") return { ok: true, message: "Thank you — you're on the list." };
    console.error("subscribe failed", e);
    return { ok: false, message: "We couldn't save your subscription right now. Please try again later." };
  }
}

const inquiry = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(160),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  topic: z.enum(["General", "Partnerships", "Venue update", "Press", "Guides"]).catch("General"),
  message: z.string().trim().min(10, "Please write at least a sentence (10+ characters).").max(5000),
});

export async function sendInquiry(_: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("company")) return { ok: true, message: "Thank you. We'll be in touch." };
  const parsed = inquiry.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  if (!(await rateLimit("inquiry", 3, 60_000))) return { ok: false, message: "Too many messages. Please try again shortly." };
  try {
    await getStore().insert("inquiries", { id: crypto.randomUUID(), ...parsed.data, created_at: now(), updated_at: now() });
    return { ok: true, message: "Thank you. Your message has reached the COURTSCAPE team — we reply within a few working days." };
  } catch (e) {
    console.error("inquiry failed", e);
    return { ok: false, message: "We couldn't send your message right now. Please email us directly." };
  }
}

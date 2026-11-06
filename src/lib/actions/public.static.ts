/**
 * Static-preview stand-ins for the server actions in ./public.ts (GitHub Pages has no server).
 * Swapped in via turbopack.resolveAlias when STATIC_EXPORT=1. Never stores or sends anything.
 */
import { SITE } from "../site";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> };

export async function subscribe(_: FormState, _fd: FormData): Promise<FormState> {
  return { ok: false, message: `Preview site: newsletter sign-up opens at launch. Until then, email ${SITE.email}.` };
}

export async function sendInquiry(_: FormState, _fd: FormData): Promise<FormState> {
  return { ok: false, message: `Preview site: this form isn't connected. Please email ${SITE.email}.` };
}

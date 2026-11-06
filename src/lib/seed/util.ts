import { createHash } from "node:crypto";

/** Deterministic UUID (v5-style layout) so JSON and SQL seeds share ids. */
export function sid(key: string): string {
  const h = createHash("sha1").update(`courtscape:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${h.slice(18, 20)}-${h.slice(20, 32)}`;
}

export const SEED_TS = "2026-11-06T00:00:00.000Z";
export const RESEARCH_DATE = "2026-11-06";
export const ts = { created_at: SEED_TS, updated_at: SEED_TS };

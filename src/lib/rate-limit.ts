import "server-only";
import { headers } from "next/headers";

const buckets = new Map<string, { count: number; reset: number }>();

/**
 * Best-effort fixed-window limiter (per server instance). Adequate for v1 abuse
 * dampening; swap for a shared store (e.g. Upstash/Supabase) at scale.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const b = buckets.get(id);
  if (!b || b.reset < now) {
    buckets.set(id, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

async function clientKey(key: string) {
  const h = await headers();
  return `${key}:${h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local"}`;
}

/** Checks a failure budget without consuming it (e.g. for login: only failures count). */
export async function isLimited(key: string, limit: number): Promise<boolean> {
  const b = buckets.get(await clientKey(key));
  return Boolean(b && b.reset > Date.now() && b.count >= limit);
}

export async function recordFailure(key: string, windowMs: number) {
  const id = await clientKey(key);
  const now = Date.now();
  const b = buckets.get(id);
  if (!b || b.reset < now) buckets.set(id, { count: 1, reset: now + windowMs });
  else b.count += 1;
}

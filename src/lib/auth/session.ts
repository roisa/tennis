import { createHmac, timingSafeEqual } from "node:crypto";

/** Stateless signed session token: base64url(payload).base64url(HMAC-SHA256). */
export type SessionPayload = { sub: string; email?: string; exp: number };

export function signSession(payload: SessionPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined, secret: string, now = Date.now()): SessionPayload | null {
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    return typeof p.exp === "number" && p.exp > now ? p : null;
  } catch {
    return null;
  }
}

/** Constant-time string comparison (hashes first so lengths don't leak). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

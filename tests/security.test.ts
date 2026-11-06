import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { safeEqual, signSession, verifySession } from "@/lib/auth/session";
import { safeKey } from "@/lib/files";
import { toMinorUnits, verifyStripeSignature } from "@/lib/payments/stripe";
import { hashToken, isTokenShape, newToken } from "@/lib/tokens";
import { extractYouTubeId } from "@/lib/admin/entities";

const SECRET = "x".repeat(40);

describe("admin session tokens", () => {
  it("round-trips a valid session", () => {
    const t = signSession({ sub: "admin", email: "e@x.com", exp: Date.now() + 60_000 }, SECRET);
    expect(verifySession(t, SECRET)?.email).toBe("e@x.com");
  });
  it("rejects tampered, expired and wrong-secret tokens", () => {
    const t = signSession({ sub: "admin", exp: Date.now() + 60_000 }, SECRET);
    const [body, sig] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "admin", exp: Date.now() + 1e12 })).toString("base64url");
    expect(verifySession(`${forged}.${sig}`, SECRET)).toBeNull();
    expect(verifySession(`${body}.${sig}x`, SECRET)).toBeNull();
    expect(verifySession(t, "y".repeat(40))).toBeNull();
    expect(verifySession(signSession({ sub: "admin", exp: Date.now() - 1 }, SECRET), SECRET)).toBeNull();
    expect(verifySession(undefined, SECRET)).toBeNull();
  });
  it("compares passwords safely", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("Stripe webhook signatures", () => {
  const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });
  const sign = (t: number, secret = "whsec_test") => `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex")}`;
  const now = 1_800_000_000;
  it("accepts a valid signature", () => expect(verifyStripeSignature(payload, sign(now), "whsec_test", 300, now)).toBe(true));
  it("rejects wrong secret, stale timestamp, tampered body and missing header", () => {
    expect(verifyStripeSignature(payload, sign(now, "other"), "whsec_test", 300, now)).toBe(false);
    expect(verifyStripeSignature(payload, sign(now - 1000), "whsec_test", 300, now)).toBe(false);
    expect(verifyStripeSignature(payload + " ", sign(now), "whsec_test", 300, now)).toBe(false);
    expect(verifyStripeSignature(payload, null, "whsec_test", 300, now)).toBe(false);
  });
  it("converts to minor units correctly", () => {
    expect(toMinorUnits(19, "USD")).toBe(1900);
    expect(toMinorUnits(5100, "JPY")).toBe(5100);
  });
});

describe("download tokens and file keys", () => {
  it("creates unguessable tokens and stores only hashes", () => {
    const a = newToken();
    expect(isTokenShape(a)).toBe(true);
    expect(newToken()).not.toBe(a);
    expect(hashToken(a)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(a)).not.toContain(a);
    expect(isTokenShape("../../etc/passwd")).toBe(false);
  });
  it("blocks path traversal in private file keys", () => {
    expect(safeKey("guides/bali.pdf")).toBe("guides/bali.pdf");
    expect(() => safeKey("../.env")).toThrow();
    expect(() => safeKey("/etc/passwd")).toThrow();
    expect(() => safeKey("guides/../../.env")).toThrow();
  });
});

describe("YouTube IDs", () => {
  it("extracts IDs from common URL forms", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://example.com/watch?v=x")).toBeNull();
  });
});

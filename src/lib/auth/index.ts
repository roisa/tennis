import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { safeEqual, signSession, verifySession } from "./session";

export const ADMIN_COOKIE = "cs_admin";
const SESSION_HOURS = 8;

export type AuthMode = "supabase" | "password" | "disabled";
export type AdminUser = { email: string; mode: AuthMode };

export function authMode(): AuthMode {
  const pref = process.env.ADMIN_AUTH_PROVIDER;
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (pref === "supabase" || (!pref && hasSupabase)) return hasSupabase ? "supabase" : "disabled";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (process.env.ADMIN_PASSWORD && secret.length >= 32) return "password";
  return "disabled";
}

export const adminEmails = () => (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

async function supabase() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const c of list) store.set(c.name, c.value, c.options);
        } catch {
          /* called from a Server Component — safe to ignore; proxy refreshes sessions */
        }
      },
    },
  });
}

export async function getAdmin(): Promise<AdminUser | null> {
  const mode = authMode();
  if (mode === "password") {
    const p = verifySession((await cookies()).get(ADMIN_COOKIE)?.value, process.env.ADMIN_SESSION_SECRET!);
    return p ? { email: p.email ?? "admin", mode } : null;
  }
  if (mode === "supabase") {
    const { data } = await (await supabase()).auth.getUser();
    const email = data.user?.email?.toLowerCase();
    return email && adminEmails().includes(email) ? { email, mode } : null;
  }
  return null;
}

/** Gate for every admin page and server action. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

export async function loginWithPassword(email: string, password: string): Promise<string | null> {
  const mode = authMode();
  if (mode === "password") {
    if (!safeEqual(password, process.env.ADMIN_PASSWORD!)) return "Incorrect email or password.";
    const allowed = adminEmails();
    if (allowed.length && !allowed.includes(email.toLowerCase())) return "Incorrect email or password.";
    const token = signSession({ sub: "admin", email: email.toLowerCase(), exp: Date.now() + SESSION_HOURS * 3600_000 }, process.env.ADMIN_SESSION_SECRET!);
    (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_HOURS * 3600 });
    return null;
  }
  if (mode === "supabase") {
    if (!adminEmails().includes(email.toLowerCase())) return "Incorrect email or password.";
    const { error } = await (await supabase()).auth.signInWithPassword({ email, password });
    return error ? "Incorrect email or password." : null;
  }
  return "Admin sign-in is not configured. See README → Environment variables.";
}

export async function logout() {
  if (authMode() === "supabase") await (await supabase()).auth.signOut();
  (await cookies()).delete(ADMIN_COOKIE);
}

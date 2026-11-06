import { redirect } from "next/navigation";
import { Wordmark } from "@/components/logo";
import { authMode, getAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  const mode = authMode();
  return (
    <main className="grid min-h-screen place-items-center bg-forest px-5">
      <div className="w-full max-w-sm bg-ivory p-8">
        <Wordmark tone="dark" />
        <h1 className="display mt-8 text-[40px] text-forest">Editor sign-in</h1>
        {mode === "disabled" && <p className="mt-3 bg-white p-3 text-[13px] text-charcoal/80 ring-1 ring-charcoal/10">Admin sign-in is not configured. Set <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_SECRET</code> (or Supabase Auth) — see the README.</p>}
        <div className="mt-6"><LoginForm disabled={mode === "disabled"} /></div>
        <p className="mt-6 text-[12px] text-charcoal/50">Signing in with {mode === "supabase" ? "Supabase Auth" : mode === "password" ? "the admin password" : "—"}.</p>
      </div>
    </main>
  );
}

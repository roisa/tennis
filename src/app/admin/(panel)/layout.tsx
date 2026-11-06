import Link from "next/link";
import { Wordmark } from "@/components/logo";
import { ENTITIES, NAV_GROUPS } from "@/lib/admin/entities";
import { logoutAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_1fr]">
      <aside className="bg-forest text-ivory lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="flex items-center justify-between p-5 lg:block">
          <Link href="/admin" aria-label="Admin dashboard"><Wordmark /></Link>
          <p className="eyebrow mt-1 text-[9px] text-lime lg:mt-2">Editorial CMS</p>
        </div>
        <nav aria-label="Admin" className="flex gap-6 overflow-x-auto px-5 pb-4 lg:block lg:space-y-6 lg:pb-8">
          <Link href="/admin" className="block text-[14px] text-ivory/80 hover:text-lime">Dashboard</Link>
          {NAV_GROUPS.map((g) => (
            <div key={g.label} className="shrink-0">
              <p className="eyebrow mb-2 hidden text-[9px] text-ivory/40 lg:block">{g.label}</p>
              <ul className="flex gap-5 lg:block lg:space-y-1.5">
                {g.items.map((k) => <li key={k}><Link className="whitespace-nowrap text-[14px] text-ivory/80 hover:text-lime" href={`/admin/${k}`}>{ENTITIES[k].label}</Link></li>)}
              </ul>
            </div>
          ))}
        </nav>
        <div className="hidden border-t border-ivory/10 p-5 text-[12px] text-ivory/60 lg:block">
          <p className="truncate">{user.email}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/" className="underline">View site</Link>
            <form action={logoutAction}><button className="underline">Sign out</button></form>
          </div>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-5 py-8 lg:px-10">
        <div className="mb-6 flex justify-end gap-4 text-[12px] lg:hidden"><Link href="/" className="underline">View site</Link><form action={logoutAction}><button className="underline">Sign out</button></form></div>
        {children}
      </main>
    </div>
  );
}

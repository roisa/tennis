import Link from "next/link";
import { authMode } from "@/lib/auth";
import { getStore } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/labels";
import { getPaymentMode } from "@/lib/payments";

export default async function Dashboard() {
  const s = getStore();
  const [dest, venues, articles, videos, guides, purchases, subs, msgs, reviews] = await Promise.all([
    s.all("destinations"), s.all("venues"), s.all("articles"), s.all("videos"), s.all("guides"), s.all("guide_purchases"), s.all("subscribers"), s.all("inquiries"), s.all("reviews"),
  ]);
  const paid = purchases.filter((p) => p.payment_status === "paid");
  const revenue = paid.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.currency]: (acc[p.currency] ?? 0) + p.amount }), {});
  const needsVerification = venues.filter((v) => ["unverified", "community_submitted", "public_sources"].includes(v.verification_status) || !v.last_verified_at);
  const drafts = [...articles.filter((a) => !a.published).map((a) => ({ k: "articles", id: a.id, t: a.title })), ...venues.filter((v) => !v.published).map((v) => ({ k: "venues", id: v.id, t: v.name }))];
  const pay = getPaymentMode();
  const integrations: [string, boolean, string][] = [
    ["Database", s.kind === "postgres", s.kind === "postgres" ? "Postgres connected" : `Local JSON store${s.writable ? "" : " (read-only)"} — set DATABASE_URL`],
    ["Admin auth", authMode() !== "disabled", authMode()],
    ["Payments", pay.mode === "live", pay.mode === "live" ? "Stripe live" : pay.mode === "test" ? "TEST MODE — no real payments" : pay.reason ?? "disabled"],
    ["File storage", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), process.env.SUPABASE_SERVICE_ROLE_KEY ? "Supabase Storage" : "Local filesystem (dev only)"],
    ["Maps", Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN), process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? "Mapbox" : "OpenStreetMap fallback"],
    ["Analytics", Boolean(process.env.NEXT_PUBLIC_GA_ID), process.env.NEXT_PUBLIC_GA_ID ? "GA4 enabled" : "Not configured"],
  ];
  const stats: [string, number | string, string][] = [
    ["Destinations", dest.length, "/admin/destinations"],
    ["Venues", `${venues.filter((v) => v.published).length}/${venues.length}`, "/admin/venues"],
    ["Reviews", reviews.length, "/admin/venues"],
    ["Articles", `${articles.filter((a) => a.published).length}/${articles.length}`, "/admin/articles"],
    ["Films", videos.length, "/admin/videos"],
    ["Guides", guides.length, "/admin/guides"],
    ["Paid orders", paid.length, "/admin/purchases"],
    ["Subscribers", subs.length, "/admin/subscribers"],
  ];
  return (
    <div className="max-w-6xl">
      <h1 className="display text-[52px] text-forest">Dashboard</h1>
      <dl className="mt-8 grid grid-cols-2 gap-px bg-charcoal/10 md:grid-cols-4">
        {stats.map(([k, v, href]) => (
          <Link key={k} href={href} className="bg-white p-5 hover:bg-ivory">
            <dt className="eyebrow text-[10px] text-charcoal/50">{k}</dt>
            <dd className="display mt-2 text-[40px] text-forest" data-testid={`stat-${k.toLowerCase().replace(/\s/g, "-")}`}>{v}</dd>
          </Link>
        ))}
      </dl>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="bg-white p-6 ring-1 ring-charcoal/10">
          <h2 className="eyebrow mb-4 text-forest">Verification queue ({needsVerification.length})</h2>
          <ul className="divide-y divide-charcoal/10 text-[14px]">
            {needsVerification.slice(0, 8).map((v) => (
              <li key={v.id} className="flex justify-between gap-4 py-2.5"><Link className="hover:underline" href={`/admin/venues/${v.id}`}>{v.name}</Link><span className="text-charcoal/50">{v.verification_status.replace(/_/g, " ")}</span></li>
            ))}
          </ul>
        </section>
        <section className="bg-white p-6 ring-1 ring-charcoal/10">
          <h2 className="eyebrow mb-4 text-forest">Drafts ({drafts.length})</h2>
          {drafts.length ? <ul className="divide-y divide-charcoal/10 text-[14px]">{drafts.slice(0, 8).map((d) => <li key={d.id} className="py-2.5"><Link className="hover:underline" href={`/admin/${d.k}/${d.id}`}>{d.t}</Link></li>)}</ul> : <p className="text-[14px] text-charcoal/60">No drafts.</p>}
        </section>
        <section className="bg-white p-6 ring-1 ring-charcoal/10">
          <h2 className="eyebrow mb-4 text-forest">Recent orders</h2>
          <p className="mb-3 text-[14px]">Revenue (paid): {Object.entries(revenue).map(([c, a]) => formatPrice(a, c)).join(", ") || "—"}</p>
          <ul className="divide-y divide-charcoal/10 text-[14px]">
            {purchases.slice(-6).reverse().map((p) => <li key={p.id} className="flex justify-between gap-3 py-2.5"><span className="truncate">{p.customer_email}</span><span className="shrink-0 text-charcoal/60">{p.payment_status} · {formatDate(p.created_at)}</span></li>)}
            {!purchases.length && <li className="py-2 text-charcoal/60">No orders yet.</li>}
          </ul>
        </section>
        <section className="bg-white p-6 ring-1 ring-charcoal/10">
          <h2 className="eyebrow mb-4 text-forest">System status</h2>
          <ul className="divide-y divide-charcoal/10 text-[14px]">
            {integrations.map(([k, ok, d]) => <li key={k} className="flex justify-between gap-3 py-2.5"><span><span aria-hidden className={`mr-2 inline-block h-2 w-2 rounded-full ${ok ? "bg-lime-2" : "bg-amber-500"}`} />{k}</span><span className="text-right text-charcoal/60">{d}</span></li>)}
          </ul>
          <p className="mt-3 text-[12px] text-charcoal/50">{msgs.length} contact messages · {subs.length} subscribers</p>
        </section>
      </div>
    </div>
  );
}

import { VenueCard } from "@/components/cards";
import { EmptyState, PageHero } from "@/components/ui";
import { getStayAndPlay } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const metadata = pageMetadata({
  title: "Stay & Play — Tennis Resorts and Hotels with Courts",
  description: "Luxury tennis resorts and hotels with courts on site, from Bali's clifftops to the Swiss Alps. Plan a tennis staycation or holiday.",
  path: "/stay-and-play",
});

export default async function StayAndPlayPage() {
  const stays = await getStayAndPlay();
  const groups = new Map<string, typeof stays>();
  for (const s of stays) {
    const k = s.destination?.country ?? "Elsewhere";
    groups.set(k, [...(groups.get(k) ?? []), s]);
  }
  return (
    <>
      <PageHero eyebrow="Stay & Play" title="Wake up. Walk to the court." intro="Resorts and hotels where tennis is part of the stay. We note who can play — guests only, members or visitors — whenever sources confirm it." />
      <div className="container-x py-20">
        {stays.length === 0 && <EmptyState title="Stays coming soon." body="We're verifying our first resort listings." />}
        {[...groups.entries()].map(([country, items]) => (
          <section key={country} className="mb-24" aria-labelledby={`g-${country}`}>
            <div className="mb-10 flex items-baseline justify-between border-b border-forest/15 pb-4">
              <h2 id={`g-${country}`} className="display text-[48px] text-forest md:text-[64px]">{country}</h2>
              <span className="eyebrow text-forest/50">{items.length} {items.length === 1 ? "stay" : "stays"}</span>
            </div>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{items.map((s) => <VenueCard key={s.venue.id} item={s} />)}</div>
          </section>
        ))}
      </div>
    </>
  );
}

import { DestinationCard } from "@/components/cards";
import { MapLoader } from "@/components/map-loader";
import { PageHero } from "@/components/ui";
import { getDestinationsWithCounts, searchVenues } from "@/lib/queries";
import { toMapPoints } from "@/lib/map-points";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const metadata = pageMetadata({
  title: "Tennis Destinations — Bali, Lombok, Maldives, Switzerland & Japan",
  description: "Explore tennis travel destinations: where to play, where to stay and how each court was verified.",
  path: "/destinations",
});

export default async function DestinationsPage() {
  const [list, venues] = await Promise.all([getDestinationsWithCounts(), searchVenues({})]);
  const byCountry = new Map<string, typeof list>();
  for (const item of list) byCountry.set(item.destination.country, [...(byCountry.get(item.destination.country) ?? []), item]);
  return (
    <>
      <PageHero eyebrow="Destinations" title="The world, court by court." intro="We begin in Indonesia and travel outward. Each destination brings together its courts, stays, stories and guides." />
      <section className="container-x py-20" aria-label="All destinations">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d, i) => <DestinationCard key={d.destination.id} destination={d.destination} venueCount={d.venueCount} index={i} />)}
        </div>
      </section>
      <section className="bg-ivory-2 py-20" aria-labelledby="atlas">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-4 text-forest/60">The atlas</p>
            <h2 id="atlas" className="display text-[52px] text-forest">Every court we&rsquo;re tracking.</h2>
            <ul className="mt-8 space-y-6">
              {[...byCountry.entries()].map(([country, items]) => (
                <li key={country}>
                  <p className="eyebrow text-[10px] text-forest/50">{country}</p>
                  <p className="mt-1 text-forest">{items.map((i) => i.destination.name).join(" · ")}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-8"><MapLoader points={toMapPoints(venues)} className="h-[520px]" /></div>
        </div>
      </section>
    </>
  );
}

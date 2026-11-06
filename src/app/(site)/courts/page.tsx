import Link from "next/link";
import { Suspense } from "react";
import { VenueCard } from "@/components/cards";
import { CourtFilters } from "@/components/court-filters";
import { MapLoader } from "@/components/map-loader";
import { EmptyState, PageHero } from "@/components/ui";
import { EXPERIENCES_META } from "@/lib/labels";
import { toMapPoints } from "@/lib/map-points";
import { getVenueFacets, searchVenues } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { activeFilterCount, parseFilters } from "@/lib/venue-filters";

export const metadata = pageMetadata({
  title: "Tennis Courts Directory — Search Courts, Resorts & Clubs",
  description: "Search beautiful tennis courts around the world by country, destination, surface and setting. Every listing shows how it was verified.",
  path: "/courts",
});

export default async function CourtsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [results, facets] = await Promise.all([searchVenues(filters), getVenueFacets()]);
  const points = toMapPoints(results);
  const showMap = sp.view === "map";
  const exp = EXPERIENCES_META.find((e) => e.key === filters.experience);
  const viewHref = (view?: string) => {
    const q = new URLSearchParams(Object.entries(sp).filter(([k, v]) => k !== "view" && typeof v === "string") as [string, string][]);
    if (view) q.set("view", view);
    return `/courts${q.size ? `?${q}` : ""}`;
  };

  return (
    <>
      <PageHero eyebrow="The Court Directory" title={exp ? exp.label : "Find your court."} intro={exp ? exp.blurb : "Search tennis courts at resorts, hotels and clubs around the world — and see exactly how each listing was verified."} />
      <div className="z-30 border-b lg:sticky lg:top-[68px] border-forest/10 bg-ivory/95 backdrop-blur">
        <div className="container-x py-5">
          <Suspense><CourtFilters countries={facets.countries} destinations={facets.destinations} /></Suspense>
        </div>
      </div>
      <section className="container-x py-10" aria-labelledby="results-title">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 id="results-title" className="eyebrow text-forest" aria-live="polite" data-testid="result-count">
            {results.length} {results.length === 1 ? "venue" : "venues"}
            {activeFilterCount(filters) > 0 && <Link href="/courts" className="link-underline ml-4 text-forest/60">Clear filters</Link>}
          </h2>
          <div className="flex gap-2 lg:hidden">
            <Link href={viewHref()} aria-current={!showMap ? "page" : undefined} className={`eyebrow px-4 py-2 text-[10px] ${!showMap ? "bg-forest text-ivory" : "border border-forest/20 text-forest"}`}>List</Link>
            <Link href={viewHref("map")} aria-current={showMap ? "page" : undefined} className={`eyebrow px-4 py-2 text-[10px] ${showMap ? "bg-forest text-ivory" : "border border-forest/20 text-forest"}`}>Map</Link>
          </div>
        </div>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className={`lg:col-span-7 ${showMap ? "hidden lg:block" : ""}`}>
            {results.length ? (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2" data-testid="venue-results">
                {results.map((r, i) => <VenueCard key={r.venue.id} item={r} priority={i < 2} />)}
              </div>
            ) : (
              <EmptyState title="No courts match — yet." body="Try removing a filter or searching a different destination. We add newly researched venues every month." action={<Link href="/courts" className="btn-forest">Clear all filters</Link>} />
            )}
          </div>
          <aside className={`lg:col-span-5 ${showMap ? "" : "hidden lg:block"}`} aria-label="Map of results">
            <div className="lg:sticky lg:top-[220px]">
              <MapLoader points={points} className="h-[70vh] lg:h-[calc(100vh-260px)]" />
              <p className="mt-3 text-xs text-stone">
                {points.length} of {results.length} venues mapped. Pins mark approximate town-centre locations until coordinates are verified.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

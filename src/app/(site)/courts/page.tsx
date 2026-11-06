import { Suspense } from "react";
import { CourtsStatic } from "@/components/courts-static";
import { CourtsView } from "@/components/courts-view";
import { getVenueFacets, searchVenues } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { IS_STATIC } from "@/lib/static-mode";
import { parseFilters } from "@/lib/venue-filters";

export const metadata = pageMetadata({
  title: "Tennis Courts Directory — Search Courts, Resorts & Clubs",
  description: "Search beautiful tennis courts around the world by country, destination, surface and setting. Every listing shows how it was verified.",
  path: "/courts",
});

export default async function CourtsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (IS_STATIC) {
    // Static preview: ship every published venue and filter in the browser.
    const [all, facets] = await Promise.all([searchVenues({}), getVenueFacets()]);
    return <Suspense fallback={<CourtsView results={all} facets={facets} filters={{ sort: "featured" }} sp={{}} />}><CourtsStatic items={all} facets={facets} /></Suspense>;
  }
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [results, facets] = await Promise.all([searchVenues(filters), getVenueFacets()]);
  return <CourtsView results={results} facets={facets} filters={filters} sp={sp} />;
}

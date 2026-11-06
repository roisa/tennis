"use client";

import { useSearchParams } from "next/navigation";
import { filterVenues, parseFilters, type VenueListItem } from "@/lib/venue-filters";
import { CourtsView } from "./courts-view";

export function CourtsStatic({ items, facets }: { items: VenueListItem[]; facets: { countries: string[]; destinations: [string, string][] } }) {
  const params = useSearchParams();
  const sp = Object.fromEntries(params.entries());
  const filters = parseFilters(sp);
  return <CourtsView results={filterVenues(items, filters)} facets={facets} filters={filters} sp={sp} />;
}

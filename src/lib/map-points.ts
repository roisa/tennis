import type { MapPoint } from "@/components/venue-map";
import type { VenueListItem } from "./venue-filters";

export function toMapPoints(items: VenueListItem[]): MapPoint[] {
  return items
    .filter((i) => i.venue.latitude != null && i.venue.longitude != null)
    .map((i) => ({
      slug: i.venue.slug,
      name: i.venue.name,
      lat: i.venue.latitude!,
      lng: i.venue.longitude!,
      subtitle: [i.venue.city, i.destination?.name].filter(Boolean).join(", "),
      approximate: i.venue.coordinates_approximate,
    }));
}

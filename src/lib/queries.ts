import "server-only";
import { cache } from "react";
import { getStore } from "./data";
import type { Article, Court, Destination, Facility, Guide, Review, Venue, VenueImage, VenueSource, Video } from "./data/schema";
import { latestScoredReview } from "./score";
import { filterVenues, type VenueFilters, type VenueListItem } from "./venue-filters";

export type { VenueFilters, VenueListItem };

/** Loads published content in one pass per request (React cache dedupes calls). */
const loadPublic = cache(async () => {
  const store = getStore();
  const [destinations, venues, courts, reviews, articles, videos, guides] = await Promise.all([
    store.all("destinations"), store.all("venues"), store.all("courts"), store.all("reviews"),
    store.all("articles"), store.all("videos"), store.all("guides"),
  ]);
  const pubDest = destinations.filter((d) => d.published).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  const destById = new Map(pubDest.map((d) => [d.id, d]));
  const pubVenues = venues.filter((v) => v.published);
  const items: VenueListItem[] = pubVenues.map((venue) => {
    const vc = courts.filter((c) => c.venue_id === venue.id);
    const scored = latestScoredReview(reviews.filter((r) => r.venue_id === venue.id));
    return {
      venue,
      destination: venue.destination_id ? destById.get(venue.destination_id) ?? null : null,
      courts: vc,
      surfaces: [...new Set(vc.map((c) => c.surface).filter((s): s is NonNullable<Court["surface"]> => s != null))],
      indoorOutdoor: [...new Set(vc.map((c) => c.indoor_outdoor).filter((s): s is NonNullable<Court["indoor_outdoor"]> => s != null))],
      score: scored?.overall ?? null,
      reviewedAt: scored?.review_date ?? null,
    };
  });
  const pubArticles = articles
    .filter((a) => a.published && a.published_at)
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
  const pubVideos = videos.filter((v) => v.published).sort((a, b) => (b.published_at ?? "9999").localeCompare(a.published_at ?? "9999"));
  const pubGuides = guides.filter((g) => g.published).sort((a, b) => Number(b.featured) - Number(a.featured));
  return { destinations: pubDest, venues: items, articles: pubArticles, videos: pubVideos, guides: pubGuides };
});

export async function getDestinations(): Promise<Destination[]> {
  return (await loadPublic()).destinations;
}

export async function getDestinationsWithCounts() {
  const { destinations, venues } = await loadPublic();
  return destinations.map((d) => ({ destination: d, venueCount: venues.filter((v) => v.destination?.id === d.id).length }));
}

export async function getDestinationBySlug(slug: string) {
  const data = await loadPublic();
  const destination = data.destinations.find((d) => d.slug === slug);
  if (!destination) return null;
  return {
    destination,
    venues: data.venues.filter((v) => v.destination?.id === destination.id),
    articles: data.articles.filter((a) => a.related_destination_id === destination.id),
    guides: data.guides.filter((g) => g.related_destination_id === destination.id),
  };
}

export async function searchVenues(filters: VenueFilters) {
  const { venues } = await loadPublic();
  return filterVenues(venues, filters);
}

export async function getVenueFacets() {
  const { venues } = await loadPublic();
  const countries = [...new Set(venues.map((v) => v.destination?.country).filter(Boolean) as string[])].sort();
  const destinations = [...new Map(venues.filter((v) => v.destination).map((v) => [v.destination!.slug, v.destination!.name])).entries()];
  return { countries, destinations };
}

export async function getFeaturedVenues(limit = 6) {
  const { venues } = await loadPublic();
  return venues.filter((v) => v.venue.featured).slice(0, limit);
}

export async function getStayAndPlay() {
  const { venues } = await loadPublic();
  return venues.filter((v) => v.venue.accommodation_available === true && ["resort", "hotel"].includes(v.venue.venue_type));
}

export type VenueDetail = VenueListItem & {
  facilities: Facility[];
  reviews: (Review & { overall: number | null })[];
  sources: VenueSource[];
  images: VenueImage[];
  articles: Article[];
  videos: Video[];
  nearby: VenueListItem[];
};

export async function getVenueBySlug(slug: string): Promise<VenueDetail | null> {
  const data = await loadPublic();
  const item = data.venues.find((v) => v.venue.slug === slug);
  if (!item) return null;
  const store = getStore();
  const id = item.venue.id;
  const [facilities, reviews, sources, images] = await Promise.all([
    store.all("facilities"), store.all("reviews"), store.all("venue_sources"), store.all("venue_images"),
  ]);
  const { computeEscapeScore } = await import("./score");
  return {
    ...item,
    facilities: facilities.filter((f) => f.venue_id === id),
    reviews: reviews
      .filter((r) => r.venue_id === id && r.published)
      .map((r) => ({ ...r, overall: computeEscapeScore(r) }))
      .sort((a, b) => (b.review_date ?? "").localeCompare(a.review_date ?? "")),
    sources: sources.filter((s) => s.venue_id === id),
    images: images.filter((i) => i.venue_id === id).sort((a, b) => a.sort_order - b.sort_order),
    articles: data.articles.filter((a) => a.related_venue_id === id || (item.destination && a.related_destination_id === item.destination.id)).slice(0, 3),
    videos: data.videos.filter((v) => v.related_venue_id === id),
    nearby: data.venues.filter((v) => v.venue.id !== id && v.destination?.id === item.destination?.id).slice(0, 3),
  };
}

export async function getArticles(category?: string) {
  const { articles } = await loadPublic();
  return category ? articles.filter((a) => a.category === category) : articles;
}

export async function getArticleBySlug(slug: string) {
  const data = await loadPublic();
  const article = data.articles.find((a) => a.slug === slug);
  if (!article) return null;
  return {
    article,
    destination: data.destinations.find((d) => d.id === article.related_destination_id) ?? null,
    venue: data.venues.find((v) => v.venue.id === article.related_venue_id) ?? null,
    videos: data.videos.filter((v) => v.related_article_id === article.id),
    related: data.articles
      .filter((a) => a.id !== article.id)
      .map((a) => ({ a, rank: (a.category === article.category ? 2 : 0) + a.tags.filter((t) => article.tags.includes(t)).length }))
      .sort((x, y) => y.rank - x.rank)
      .slice(0, 3)
      .map((x) => x.a),
  };
}

export async function getVideos() {
  const data = await loadPublic();
  return data.videos.map((video) => ({
    video,
    venue: data.venues.find((v) => v.venue.id === video.related_venue_id) ?? null,
    article: data.articles.find((a) => a.id === video.related_article_id) ?? null,
  }));
}

export async function getGuides(): Promise<Guide[]> {
  return (await loadPublic()).guides;
}

export async function getGuideBySlug(slug: string) {
  const data = await loadPublic();
  const guide = data.guides.find((g) => g.slug === slug);
  if (!guide) return null;
  return {
    guide,
    destination: data.destinations.find((d) => d.id === guide.related_destination_id) ?? null,
    venues: data.venues.filter((v) => v.destination?.id === guide.related_destination_id).slice(0, 6),
    others: data.guides.filter((g) => g.id !== guide.id),
  };
}

/** Strips private fields before a guide is serialised to the client. */
export function publicGuide(g: Guide) {
  const { downloadable_file, ...rest } = g;
  return { ...rest, available: Boolean(downloadable_file) };
}

export async function getSitemapData() {
  const d = await loadPublic();
  return d;
}

export type PublicGuide = ReturnType<typeof publicGuide>;
export type { Venue };

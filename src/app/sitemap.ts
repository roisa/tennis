import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const d = await getSitemapData();
  const stat = ["/", "/discover", "/destinations", "/courts", "/stay-and-play", "/journal", "/films", "/guides", "/about", "/contact", "/privacy", "/terms"];
  return [
    ...stat.map((p) => ({ url: absoluteUrl(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...d.destinations.map((x) => ({ url: absoluteUrl(`/destinations/${x.slug}`), lastModified: x.updated_at, priority: 0.8 })),
    ...d.venues.map((x) => ({ url: absoluteUrl(`/courts/${x.venue.slug}`), lastModified: x.venue.updated_at, priority: 0.7 })),
    ...d.articles.map((x) => ({ url: absoluteUrl(`/journal/${x.slug}`), lastModified: x.updated_at, priority: 0.6 })),
    ...d.guides.map((x) => ({ url: absoluteUrl(`/guides/${x.slug}`), lastModified: x.updated_at, priority: 0.6 })),
  ];
}

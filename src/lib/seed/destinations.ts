import type { Destination } from "../data/schema";
import { sid, ts } from "./util";

const d = (o: Omit<Destination, "id" | "created_at" | "updated_at" | "cover_image" | "cover_alt"> & { key: string }): Destination => {
  const { key, ...rest } = o;
  return { id: sid(`destination:${key}`), cover_image: null, cover_alt: null, ...rest, ...ts };
};

export const destinations: Destination[] = [
  d({
    key: "bali", name: "Bali", slug: "bali", country: "Indonesia", country_code: "ID", region: "Bali Province", city: null,
    tagline: "Clifftops, caldera lakes and courts carved into the island's green interior.",
    description:
      "Bali is COURTSCAPE's first editorial base. Our research shortlist spans the clifftops of the Bukit Peninsula, the bay at Jimbaran, the river valleys around Ubud and the cool highlands near Bedugul. Every listing below is a research candidate: we publish what public sources say, label it clearly, and update each venue as we verify it in person.",
    latitude: -8.4095, longitude: 115.1889, scene: "cliff", experiences: ["ocean", "jungle", "mountain", "luxury"], featured: true, sort_order: 1, published: true,
  }),
  d({
    key: "lombok", name: "Lombok", slug: "lombok", country: "Indonesia", country_code: "ID", region: "West Nusa Tenggara", city: null,
    tagline: "Bali's quieter neighbour, where the volcano watches over the coast.",
    description:
      "East of Bali across the Lombok Strait, Lombok rewards travellers who want more space and slower days. Our research begins on the Senggigi coast on the island's west side.",
    latitude: -8.65, longitude: 116.32, scene: "volcano", experiences: ["ocean", "hidden"], featured: true, sort_order: 2, published: true,
  }),
  d({
    key: "java", name: "Java", slug: "java", country: "Indonesia", country_code: "ID", region: null, city: null,
    tagline: "Highland towns, volcanic ridges and the courts of Indonesia's busiest island.",
    description:
      "Java's highland towns and cities have a long tennis culture. Venue research for Java is in progress; listings will appear here once sourced.",
    latitude: -7.6145, longitude: 110.7122, scene: "terraces", experiences: ["mountain", "city", "hidden"], featured: true, sort_order: 3, published: true,
  }),
  d({
    key: "maldives", name: "Maldives", slug: "maldives", country: "Maldives", country_code: "MV", region: null, city: null,
    tagline: "Floodlit courts a few steps from the lagoon.",
    description:
      "A handful of Maldivian island resorts keep tennis courts among the palms. Our shortlist focuses on resorts whose own materials explicitly describe their courts.",
    latitude: 3.2028, longitude: 73.2207, scene: "lagoon", experiences: ["ocean", "luxury"], featured: true, sort_order: 4, published: true,
  }),
  d({
    key: "switzerland", name: "Switzerland", slug: "switzerland", country: "Switzerland", country_code: "CH", region: null, city: null,
    tagline: "Summer clay beneath the peaks of the Bernese Oberland and the Engadin.",
    description:
      "The grand hotels of the Swiss Alps have played summer tennis on clay for generations. We begin with Gstaad and St. Moritz.",
    latitude: 46.8182, longitude: 8.2275, scene: "alpine", experiences: ["mountain", "luxury"], featured: true, sort_order: 5, published: true,
  }),
  d({
    key: "japan", name: "Japan", slug: "japan", country: "Japan", country_code: "JP", region: null, city: null,
    tagline: "Highland resort courts in Nagano and island tennis in Okinawa.",
    description:
      "From the forested resort town of Karuizawa to the subtropical coast of Okinawa, Japan offers two very different tennis escapes.",
    latitude: 36.2048, longitude: 138.2529, scene: "zen", experiences: ["mountain", "ocean", "luxury"], featured: true, sort_order: 6, published: true,
  }),
];

export const destinationId = (key: string) => sid(`destination:${key}`);

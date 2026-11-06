import { INDOOR_OUTDOOR, SETTINGS, SURFACES, VENUE_TYPES, type Court, type Destination, type Venue } from "./data/schema";

export type VenueListItem = {
  venue: Venue;
  destination: Destination | null;
  courts: Court[];
  surfaces: NonNullable<Court["surface"]>[];
  indoorOutdoor: NonNullable<Court["indoor_outdoor"]>[];
  score: number | null;
  reviewedAt: string | null;
};

export const SORTS = ["featured", "recent", "score"] as const;

export type VenueFilters = {
  q?: string;
  country?: string;
  destination?: string;
  surface?: (typeof SURFACES)[number];
  environment?: (typeof INDOOR_OUTDOOR)[number];
  setting?: (typeof SETTINGS)[number];
  type?: "resort" | "club" | (typeof VENUE_TYPES)[number];
  experience?: string;
  sort?: (typeof SORTS)[number];
};

const pick = <T extends readonly string[]>(v: unknown, allowed: T): T[number] | undefined =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T[number]) : undefined;

/** Parses untrusted URL search params into typed filters (unknown values are dropped). */
export function parseFilters(sp: Record<string, string | string[] | undefined>): VenueFilters {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) as string | undefined;
  const q = one("q")?.trim().slice(0, 100);
  return {
    q: q || undefined,
    country: one("country")?.slice(0, 80) || undefined,
    destination: one("destination")?.slice(0, 120) || undefined,
    surface: pick(one("surface"), SURFACES),
    environment: pick(one("environment"), INDOOR_OUTDOOR),
    setting: pick(one("setting"), SETTINGS),
    type: pick(one("type"), VENUE_TYPES),
    experience: one("experience")?.slice(0, 40) || undefined,
    sort: pick(one("sort"), SORTS) ?? "featured",
  };
}

const norm = (s: string | null | undefined) => (s ?? "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function filterVenues(items: VenueListItem[], f: VenueFilters): VenueListItem[] {
  const terms = norm(f.q).split(/\s+/).filter(Boolean);
  const out = items.filter(({ venue: v, destination: d, surfaces, indoorOutdoor }) => {
    if (terms.length) {
      const hay = norm([v.name, v.city, v.address, v.summary, d?.name, d?.country, d?.region].join(" "));
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    if (f.country && d?.country !== f.country) return false;
    if (f.destination && d?.slug !== f.destination) return false;
    if (f.surface && !surfaces.includes(f.surface)) return false;
    if (f.environment) {
      // "both" venues satisfy indoor and outdoor searches.
      if (!(indoorOutdoor.includes(f.environment) || (f.environment !== "both" && indoorOutdoor.includes("both")))) return false;
    }
    if (f.setting && v.setting !== f.setting) return false;
    if (f.type) {
      // "resort" groups resorts and hotels; "club" groups clubs, academies and public courts.
      const group = (t: string) => (["resort", "hotel"].includes(t) ? "resort" : "club");
      if (f.type === "resort" || f.type === "club" ? group(v.venue_type) !== f.type : v.venue_type !== f.type) return false;
    }
    if (f.experience && !v.experiences.includes(f.experience as never)) return false;
    return true;
  });
  const byName = (a: VenueListItem, b: VenueListItem) => a.venue.name.localeCompare(b.venue.name);
  switch (f.sort) {
    case "score":
      // Scored venues first (highest first); unscored follow alphabetically — never ranked as zero.
      return out.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || byName(a, b));
    case "recent":
      return out.sort((a, b) => (b.reviewedAt ?? "").localeCompare(a.reviewedAt ?? "") || (b.venue.updated_at ?? "").localeCompare(a.venue.updated_at ?? "") || byName(a, b));
    default:
      return out.sort((a, b) => Number(b.venue.featured) - Number(a.venue.featured) || (a.destination?.sort_order ?? 999) - (b.destination?.sort_order ?? 999) || byName(a, b));
  }
}

export function activeFilterCount(f: VenueFilters) {
  return (["q", "country", "destination", "surface", "environment", "setting", "type", "experience"] as const).filter((k) => f[k]).length;
}

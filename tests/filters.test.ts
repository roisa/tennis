import { describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { filterVenues, parseFilters, type VenueListItem } from "@/lib/venue-filters";

function items(): VenueListItem[] {
  const db = buildSeed();
  return db.venues.map((venue) => {
    const courts = db.courts.filter((c) => c.venue_id === venue.id);
    return {
      venue, courts, destination: db.destinations.find((d) => d.id === venue.destination_id) ?? null,
      surfaces: [...new Set(courts.map((c) => c.surface).filter(Boolean))] as never,
      indoorOutdoor: [...new Set(courts.map((c) => c.indoor_outdoor).filter(Boolean))] as never,
      score: null, reviewedAt: null,
    };
  });
}

describe("venue filters", () => {
  it("drops unknown filter values from the URL", () => {
    expect(parseFilters({ surface: "lava", sort: "nope", setting: "mountain" })).toMatchObject({ surface: undefined, sort: "featured", setting: "mountain" });
  });
  it("searches across venue, city, destination and country (accent-insensitive)", () => {
    const r = filterVenues(items(), { q: "jimbaran" });
    expect(r.map((x) => x.venue.slug).sort()).toEqual(["intercontinental-bali-resort", "raffles-bali"]);
    expect(filterVenues(items(), { q: "switzerland" })).toHaveLength(2);
  });
  it("filters by surface, country, destination, setting and type", () => {
    expect(filterVenues(items(), { surface: "clay" }).map((x) => x.venue.slug).sort()).toEqual(["gstaad-palace", "kula-mani-tennis-village", "raffles-bali", "suvretta-house"]);
    expect(filterVenues(items(), { country: "Japan" })).toHaveLength(2);
    expect(filterVenues(items(), { destination: "lombok" })).toHaveLength(1);
    expect(filterVenues(items(), { setting: "mountain" }).every((x) => x.venue.setting === "mountain")).toBe(true);
    expect(filterVenues(items(), { type: "club" }).map((x) => x.venue.slug)).toEqual(["kula-mani-tennis-village"]);
    expect(filterVenues(items(), { environment: "outdoor" }).length).toBeGreaterThan(0);
  });
  it("never ranks unscored venues as zero when sorting by score", () => {
    const list = items();
    list[3].score = 8.4;
    list[5].score = 9.1;
    const sorted = filterVenues(list, { sort: "score" });
    expect(sorted.slice(0, 2).map((x) => x.score)).toEqual([9.1, 8.4]);
    expect(sorted.slice(2).every((x) => x.score == null)).toBe(true);
  });
});

describe("seed integrity", () => {
  const db = buildSeed();
  it("contains no fabricated reviews, scores or rental prices", () => {
    expect(db.reviews).toHaveLength(0);
    expect(db.courts.every((c) => c.rental_price == null)).toBe(true);
  });
  it("never marks research candidates as personally reviewed or verified", () => {
    expect(db.venues.every((v) => v.verification_status === "public_sources" && v.last_verified_at == null)).toBe(true);
  });
  it("gives every venue at least one source with a consultation date", () => {
    for (const v of db.venues) {
      const s = db.venue_sources.filter((x) => x.venue_id === v.id);
      expect(s.length, v.name).toBeGreaterThan(0);
      expect(s.every((x) => x.accessed_at)).toBe(true);
    }
  });
  it("has unique slugs", () => {
    for (const t of ["destinations", "venues", "articles", "guides", "videos"] as const) {
      const slugs = db[t].map((r) => r.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});

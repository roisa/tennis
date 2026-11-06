import type { VerificationStatus } from "./data/schema";

export const VERIFICATION_LABELS: Record<VerificationStatus, { label: string; short: string; description: string }> = {
  personally_reviewed: { label: "Personally reviewed", short: "Reviewed", description: "A COURTSCAPE editor has visited and played here." },
  venue_verified: { label: "Information verified with venue", short: "Venue verified", description: "Details confirmed directly with the venue. Not yet visited by COURTSCAPE." },
  public_sources: { label: "Sourced from public information", short: "Public sources", description: "Compiled from the venue's own or reputable public materials. Not yet confirmed with the venue or visited." },
  community_submitted: { label: "Community submitted", short: "Community", description: "Submitted by a reader. Not yet checked by COURTSCAPE." },
  unverified: { label: "Not yet verified", short: "Unverified", description: "Unconfirmed details. Treat with caution." },
};

export const SURFACE_LABELS: Record<string, string> = {
  hard: "Hard", clay: "Clay", grass: "Grass", artificial_grass: "Synthetic grass", carpet: "Carpet", other: "Other",
};
export const SETTING_LABELS: Record<string, string> = {
  mountain: "Mountain", beach: "Beach & coast", jungle: "Jungle", city: "City", countryside: "Countryside", island: "Island",
};
export const VENUE_TYPE_LABELS: Record<string, string> = {
  resort: "Resort", hotel: "Hotel", club: "Tennis club", academy: "Academy", public: "Public courts",
};
export const ACCESS_LABELS: Record<string, string> = {
  guests_only: "Hotel guests", public: "Open to visitors", members: "Members", day_pass: "Day pass", on_request: "On request", unknown: "To be confirmed",
};
export const INDOOR_LABELS: Record<string, string> = { indoor: "Indoor", outdoor: "Outdoor", both: "Indoor & outdoor" };

export const EXPERIENCES_META = [
  { key: "mountain", label: "Mountain Courts", scene: "alpine", blurb: "Thin air, cool mornings and peaks beyond the baseline." },
  { key: "ocean", label: "Ocean Views", scene: "ocean", blurb: "Courts within sight — and sound — of the sea." },
  { key: "jungle", label: "Jungle Escapes", scene: "jungle", blurb: "Green walls, birdsong and river valleys." },
  { key: "luxury", label: "Luxury Resorts", scene: "garden", blurb: "Grand hotels where tennis is part of the ritual." },
  { key: "hidden", label: "Hidden Gems", scene: "terraces", blurb: "Quiet courts most travellers never find." },
  { key: "city", label: "City Tennis", scene: "city", blurb: "Rooftops, clubs and urban courts worth a detour." },
] as const;

export function formatDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return Number.isNaN(d.getTime()) ? null : new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(d);
}

export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
}

export function slugify(input: string) {
  return input.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

import {
  ACCESS_TYPES, ARTICLE_CATEGORIES, EXPERIENCES, FACILITY_CATEGORIES, INDOOR_OUTDOOR, SCENES, SETTINGS, SURFACES, VENUE_TYPES,
  VERIFICATION_STATUSES, VIDEO_CATEGORIES, type TableName,
} from "../data/schema";
import { ACCESS_LABELS, INDOOR_LABELS, SETTING_LABELS, SURFACE_LABELS, VENUE_TYPE_LABELS, VERIFICATION_LABELS } from "../labels";

export type FieldType =
  | "text" | "textarea" | "markdown" | "number" | "boolean" | "tristate" | "select" | "multiselect"
  | "tags" | "lines" | "date" | "url" | "email" | "relation" | "image" | "slug" | "youtube";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: readonly (readonly [string, string])[];
  relation?: { table: TableName; label: string };
  required?: boolean;
  help?: string;
  slugFrom?: string;
  step?: string;
  span?: 1 | 2;
};

export type Entity = {
  key: string;
  table: TableName;
  label: string;
  singular: string;
  titleField: string;
  fields: Field[];
  listColumns: string[];
  children?: string[];
  parentField?: string;
  readOnly?: boolean;
  publicPath?: (row: Record<string, unknown>) => string;
};

const opts = (values: readonly string[], labels?: Record<string, string>) => values.map((v) => [v, labels?.[v] ?? v.replace(/_/g, " ")] as const);
const verification: Field = { name: "verification_status", label: "Verification", type: "select", options: opts(VERIFICATION_STATUSES, Object.fromEntries(Object.entries(VERIFICATION_LABELS).map(([k, v]) => [k, v.label]))) };
const scene: Field = { name: "scene", label: "Placeholder artwork", type: "select", options: opts(SCENES), help: "Shown until a cover photo is added." };
const score = (name: string, label: string): Field => ({ name, label, type: "number", step: "0.5", help: "1–10" });

export const ENTITIES: Record<string, Entity> = {
  destinations: {
    key: "destinations", table: "destinations", label: "Destinations", singular: "destination", titleField: "name",
    listColumns: ["name", "country", "featured", "published"], publicPath: (r) => `/destinations/${r.slug}`,
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "name" },
      { name: "country", label: "Country", type: "text", required: true },
      { name: "country_code", label: "ISO country code", type: "text", help: "Two letters, e.g. ID" },
      { name: "region", label: "Region", type: "text" },
      { name: "city", label: "City", type: "text" },
      { name: "tagline", label: "Tagline", type: "text", span: 2 },
      { name: "description", label: "Description", type: "textarea", span: 2 },
      { name: "latitude", label: "Latitude", type: "number", step: "any" },
      { name: "longitude", label: "Longitude", type: "number", step: "any" },
      { name: "cover_image", label: "Cover photo", type: "image", span: 2 },
      { name: "cover_alt", label: "Cover alt text", type: "text", span: 2 },
      scene,
      { name: "experiences", label: "Experiences", type: "multiselect", options: opts(EXPERIENCES) },
      { name: "sort_order", label: "Sort order", type: "number", step: "1" },
      { name: "featured", label: "Featured on homepage", type: "boolean" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  venues: {
    key: "venues", table: "venues", label: "Venues", singular: "venue", titleField: "name",
    listColumns: ["name", "destination_id", "verification_status", "last_verified_at", "featured", "published"],
    children: ["courts", "facilities", "reviews", "venue_sources", "venue_images"], publicPath: (r) => `/courts/${r.slug}`,
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "name" },
      { name: "destination_id", label: "Destination", type: "relation", relation: { table: "destinations", label: "name" } },
      { name: "venue_type", label: "Venue type", type: "select", options: opts(VENUE_TYPES, VENUE_TYPE_LABELS) },
      { name: "setting", label: "Setting", type: "select", options: opts(SETTINGS, SETTING_LABELS) },
      { name: "experiences", label: "Experiences", type: "multiselect", options: opts(EXPERIENCES) },
      { name: "summary", label: "Summary", type: "textarea", span: 2, help: "One or two sentences for cards and search results." },
      { name: "description", label: "Description", type: "textarea", span: 2 },
      { name: "city", label: "City / area", type: "text" },
      { name: "address", label: "Address", type: "text" },
      { name: "website", label: "Official website", type: "url" },
      { name: "booking_url", label: "Booking URL", type: "url" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "latitude", label: "Latitude", type: "number", step: "any" },
      { name: "longitude", label: "Longitude", type: "number", step: "any" },
      { name: "coordinates_approximate", label: "Coordinates are approximate", type: "boolean" },
      { name: "access_type", label: "Who can play", type: "select", options: opts(ACCESS_TYPES, ACCESS_LABELS) },
      { name: "accommodation_available", label: "Accommodation on site", type: "tristate" },
      verification,
      { name: "last_verified_at", label: "Last verified", type: "date" },
      { name: "verification_notes", label: "Verification notes (public)", type: "textarea", span: 2 },
      { name: "cover_image", label: "Cover photo", type: "image", span: 2 },
      { name: "cover_alt", label: "Cover alt text", type: "text", span: 2 },
      scene,
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  courts: {
    key: "courts", table: "courts", label: "Courts", singular: "court", titleField: "court_name", parentField: "venue_id",
    listColumns: ["court_name", "surface", "court_count", "verification_status"],
    fields: [
      { name: "court_name", label: "Court name", type: "text", required: true },
      { name: "surface", label: "Surface", type: "select", options: opts(SURFACES, SURFACE_LABELS) },
      { name: "indoor_outdoor", label: "Indoor / outdoor", type: "select", options: opts(INDOOR_OUTDOOR, INDOOR_LABELS) },
      { name: "court_count", label: "Number of courts", type: "number", step: "1" },
      { name: "covered", label: "Covered", type: "tristate" },
      { name: "lighting", label: "Floodlights", type: "tristate" },
      { name: "rental_price", label: "Hourly rental price", type: "number", step: "0.01", help: "Only when confirmed." },
      { name: "rental_currency", label: "Currency", type: "text", help: "ISO code, e.g. IDR" },
      { name: "booking_requirements", label: "Booking requirements", type: "textarea", span: 2 },
      verification,
    ],
  },
  facilities: {
    key: "facilities", table: "facilities", label: "Facilities", singular: "facility", titleField: "name", parentField: "venue_id",
    listColumns: ["name", "category", "verification_status"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: opts(FACILITY_CATEGORIES) },
      { name: "description", label: "Description", type: "textarea", span: 2 },
      verification,
    ],
  },
  reviews: {
    key: "reviews", table: "reviews", label: "Reviews", singular: "review", titleField: "reviewer", parentField: "venue_id",
    listColumns: ["reviewer", "review_date", "overall_score", "personally_visited", "published"],
    fields: [
      { name: "reviewer", label: "Reviewer", type: "text", required: true },
      { name: "review_date", label: "Visit date", type: "date" },
      { name: "personally_visited", label: "I personally visited and played here", type: "boolean", help: "Required before any score can be entered." },
      score("scenery_score", "Scenery"),
      score("tennis_quality_score", "Tennis quality"),
      score("stay_experience_score", "Stay experience"),
      score("accessibility_score", "Accessibility"),
      score("family_experience_score", "Family experience"),
      { name: "review_notes", label: "Review notes", type: "textarea", span: 2 },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  venue_sources: {
    key: "venue_sources", table: "venue_sources", label: "Sources", singular: "source", titleField: "title", parentField: "venue_id",
    listColumns: ["title", "url", "accessed_at"],
    fields: [
      { name: "url", label: "Source URL", type: "url", required: true, span: 2 },
      { name: "title", label: "Title", type: "text" },
      { name: "accessed_at", label: "Date consulted", type: "date" },
      { name: "fact", label: "What it supports", type: "textarea", span: 2 },
    ],
  },
  venue_images: {
    key: "venue_images", table: "venue_images", label: "Photos", singular: "photo", titleField: "alt", parentField: "venue_id",
    listColumns: ["alt", "credit", "sort_order"],
    fields: [
      { name: "url", label: "Photo", type: "image", required: true, span: 2 },
      { name: "alt", label: "Alt text", type: "text", required: true, span: 2 },
      { name: "credit", label: "Credit", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number", step: "1" },
    ],
  },
  articles: {
    key: "articles", table: "articles", label: "Journal", singular: "article", titleField: "title",
    listColumns: ["title", "category", "published_at", "published"], publicPath: (r) => `/journal/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, span: 2 },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "title" },
      { name: "category", label: "Category", type: "select", options: opts(ARTICLE_CATEGORIES) },
      { name: "excerpt", label: "Excerpt", type: "textarea", span: 2 },
      { name: "body", label: "Body", type: "markdown", span: 2, help: "Markdown: ## Heading, **bold**, *italic*, [link](/courts/slug), - list, > quote" },
      { name: "author", label: "Author", type: "text" },
      { name: "published_at", label: "Publication date", type: "date" },
      { name: "tags", label: "Tags", type: "tags", help: "Comma-separated" },
      { name: "related_destination_id", label: "Related destination", type: "relation", relation: { table: "destinations", label: "name" } },
      { name: "related_venue_id", label: "Related venue", type: "relation", relation: { table: "venues", label: "name" } },
      { name: "cover_image", label: "Cover photo", type: "image", span: 2 },
      { name: "cover_alt", label: "Cover alt text", type: "text", span: 2 },
      scene,
      { name: "seo_title", label: "SEO title", type: "text", help: "≤ 70 characters" },
      { name: "seo_description", label: "SEO description", type: "textarea", help: "≤ 170 characters" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  videos: {
    key: "videos", table: "videos", label: "Films", singular: "film", titleField: "title",
    listColumns: ["title", "category", "youtube_video_id", "published"], publicPath: (r) => `/films#${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, span: 2 },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "title" },
      { name: "youtube_video_id", label: "YouTube URL or ID", type: "youtube", help: "Paste a YouTube link — the ID is extracted." },
      { name: "category", label: "Category", type: "select", options: opts(VIDEO_CATEGORIES) },
      { name: "duration", label: "Duration", type: "text", help: "e.g. 4:30" },
      { name: "description", label: "Description", type: "textarea", span: 2 },
      { name: "related_venue_id", label: "Related venue", type: "relation", relation: { table: "venues", label: "name" } },
      { name: "related_article_id", label: "Related article", type: "relation", relation: { table: "articles", label: "title" } },
      { name: "thumbnail", label: "Custom thumbnail", type: "image", span: 2 },
      scene,
      { name: "published_at", label: "Release date", type: "date" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  guides: {
    key: "guides", table: "guides", label: "Guides", singular: "guide", titleField: "title",
    listColumns: ["title", "price", "currency", "featured", "published"], publicPath: (r) => `/guides/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, span: 2 },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "title" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "description", label: "Description", type: "textarea", span: 2 },
      { name: "contents", label: "Contents (one per line)", type: "lines", span: 2 },
      { name: "includes", label: "What's included (one per line)", type: "lines", span: 2 },
      { name: "price", label: "Price", type: "number", step: "0.01", required: true },
      { name: "currency", label: "Currency", type: "text", help: "ISO code, e.g. USD" },
      { name: "format", label: "Format", type: "text" },
      { name: "page_count", label: "Pages", type: "number", step: "1" },
      { name: "related_destination_id", label: "Destination", type: "relation", relation: { table: "destinations", label: "name" } },
      { name: "downloadable_file", label: "Private file key", type: "text", help: "Path in the private bucket, e.g. guides/bali.pdf. Leave empty to show 'Coming soon'." },
      { name: "status_note", label: "Status note (public)", type: "text", span: 2 },
      { name: "cover_image", label: "Cover image", type: "image", span: 2 },
      scene,
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  purchases: {
    key: "purchases", table: "guide_purchases", label: "Purchases", singular: "purchase", titleField: "customer_email", readOnly: true,
    listColumns: ["customer_email", "guide_id", "provider", "payment_status", "amount", "purchase_date", "download_count"], fields: [],
  },
  subscribers: { key: "subscribers", table: "subscribers", label: "Subscribers", singular: "subscriber", titleField: "email", readOnly: true, listColumns: ["email", "source", "created_at"], fields: [] },
  inquiries: { key: "inquiries", table: "inquiries", label: "Messages", singular: "message", titleField: "name", readOnly: true, listColumns: ["name", "email", "topic", "message", "created_at"], fields: [] },
};

export const NAV_GROUPS = [
  { label: "Directory", items: ["destinations", "venues"] },
  { label: "Magazine", items: ["articles", "videos"] },
  { label: "Commerce", items: ["guides", "purchases"] },
  { label: "Audience", items: ["subscribers", "inquiries"] },
];

export function getEntity(key: string): Entity | null {
  return Object.prototype.hasOwnProperty.call(ENTITIES, key) ? ENTITIES[key] : null;
}

export function extractYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.endsWith("youtu.be")) return u.pathname.slice(1, 12) || null;
    if (u.hostname.includes("youtube")) {
      const v = u.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const m = u.pathname.match(/\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
      return m?.[1] ?? null;
    }
  } catch {
    /* not a URL */
  }
  return null;
}

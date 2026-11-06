import { z } from "zod";

/**
 * Single source of truth for COURTSCAPE data shapes.
 * Mirrors supabase/migrations/0001_init.sql — keep both in sync.
 */

export const VERIFICATION_STATUSES = [
  "personally_reviewed",
  "venue_verified",
  "public_sources",
  "community_submitted",
  "unverified",
] as const;
export const SURFACES = ["hard", "clay", "grass", "artificial_grass", "carpet", "other"] as const;
export const INDOOR_OUTDOOR = ["indoor", "outdoor", "both"] as const;
export const SETTINGS = ["mountain", "beach", "jungle", "city", "countryside", "island"] as const;
export const EXPERIENCES = ["mountain", "ocean", "jungle", "luxury", "hidden", "city"] as const;
export const VENUE_TYPES = ["resort", "hotel", "club", "academy", "public"] as const;
export const ACCESS_TYPES = ["guests_only", "public", "members", "day_pass", "on_request", "unknown"] as const;
export const SCENES = ["ocean", "cliff", "mountain", "alpine", "jungle", "city", "volcano", "lagoon", "garden", "zen", "terraces"] as const;
export const FACILITY_CATEGORIES = ["tennis", "wellness", "dining", "family", "fitness", "other"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded", "test"] as const;
export const ARTICLE_CATEGORIES = ["Destinations", "Courts", "Stay & Play", "Field Notes", "Method", "Planning"] as const;
export const VIDEO_CATEGORIES = ["Court Portrait", "Destination Film", "Travel Diary", "Interview"] as const;

const id = z.string().uuid();
const nullableText = z.string().trim().max(20000).nullable().default(null);
const nullableUrl = z.string().trim().url().max(2000).nullable().default(null);
const slug = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");
const lat = z.number().min(-90).max(90).nullable().default(null);
const lng = z.number().min(-180).max(180).nullable().default(null);
const score = z.number().min(1).max(10).nullable().default(null);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/).nullable().default(null);
const timestamps = { created_at: z.string(), updated_at: z.string() };

export const destinationSchema = z.object({
  id,
  name: z.string().trim().min(1).max(160),
  slug,
  country: z.string().trim().min(1).max(120),
  country_code: z.string().trim().length(2).toUpperCase().nullable().default(null),
  region: nullableText,
  city: nullableText,
  tagline: nullableText,
  description: nullableText,
  latitude: lat,
  longitude: lng,
  cover_image: nullableUrl,
  cover_alt: nullableText,
  scene: z.enum(SCENES).default("ocean"),
  experiences: z.array(z.enum(EXPERIENCES)).default([]),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(100),
  published: z.boolean().default(false),
  ...timestamps,
});

export const venueSchema = z.object({
  id,
  destination_id: id.nullable().default(null),
  name: z.string().trim().min(1).max(200),
  slug,
  venue_type: z.enum(VENUE_TYPES).default("resort"),
  setting: z.enum(SETTINGS).nullable().default(null),
  experiences: z.array(z.enum(EXPERIENCES)).default([]),
  summary: nullableText,
  description: nullableText,
  address: nullableText,
  city: nullableText,
  website: nullableUrl,
  booking_url: nullableUrl,
  phone: nullableText,
  email: z.string().trim().email().nullable().default(null),
  latitude: lat,
  longitude: lng,
  coordinates_approximate: z.boolean().default(true),
  access_type: z.enum(ACCESS_TYPES).default("unknown"),
  accommodation_available: z.boolean().nullable().default(null),
  verification_status: z.enum(VERIFICATION_STATUSES).default("unverified"),
  verification_notes: nullableText,
  last_verified_at: isoDate,
  cover_image: nullableUrl,
  cover_alt: nullableText,
  scene: z.enum(SCENES).default("ocean"),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  ...timestamps,
});

export const courtSchema = z.object({
  id,
  venue_id: id,
  court_name: z.string().trim().min(1).max(160),
  surface: z.enum(SURFACES).nullable().default(null),
  indoor_outdoor: z.enum(INDOOR_OUTDOOR).nullable().default(null),
  covered: z.boolean().nullable().default(null),
  lighting: z.boolean().nullable().default(null),
  court_count: z.number().int().min(1).max(100).nullable().default(null),
  rental_price: z.number().min(0).nullable().default(null),
  rental_currency: z.string().trim().length(3).toUpperCase().nullable().default(null),
  booking_requirements: nullableText,
  verification_status: z.enum(VERIFICATION_STATUSES).default("unverified"),
  ...timestamps,
});

export const facilitySchema = z.object({
  id,
  venue_id: id,
  category: z.enum(FACILITY_CATEGORIES).default("other"),
  name: z.string().trim().min(1).max(160),
  description: nullableText,
  verification_status: z.enum(VERIFICATION_STATUSES).default("unverified"),
  ...timestamps,
});

export const reviewSchema = z.object({
  id,
  venue_id: id,
  reviewer: z.string().trim().min(1).max(160),
  scenery_score: score,
  tennis_quality_score: score,
  stay_experience_score: score,
  accessibility_score: score,
  family_experience_score: score,
  /** Derived — never entered by hand. Computed in the DB (generated column) and in computeEscapeScore(). */
  overall_score: z.number().nullable().default(null),
  review_date: isoDate,
  review_notes: nullableText,
  personally_visited: z.boolean().default(false),
  published: z.boolean().default(false),
  ...timestamps,
});

export const sourceSchema = z.object({
  id,
  venue_id: id,
  url: z.string().trim().url().max(2000),
  title: nullableText,
  fact: nullableText,
  accessed_at: isoDate,
  ...timestamps,
});

export const venueImageSchema = z.object({
  id,
  venue_id: id,
  url: z.string().trim().url().max(2000),
  alt: z.string().trim().min(1).max(300),
  credit: nullableText,
  sort_order: z.number().int().default(100),
  ...timestamps,
});

export const articleSchema = z.object({
  id,
  title: z.string().trim().min(1).max(200),
  slug,
  excerpt: nullableText,
  body: z.string().max(200000).default(""),
  cover_image: nullableUrl,
  cover_alt: nullableText,
  scene: z.enum(SCENES).default("ocean"),
  author: z.string().trim().max(160).default("COURTSCAPE Editors"),
  category: z.enum(ARTICLE_CATEGORIES).default("Field Notes"),
  tags: z.array(z.string().trim().min(1).max(40)).default([]),
  related_destination_id: id.nullable().default(null),
  related_venue_id: id.nullable().default(null),
  published_at: isoDate,
  seo_title: z.string().trim().max(70).nullable().default(null),
  seo_description: z.string().trim().max(170).nullable().default(null),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  ...timestamps,
});

export const videoSchema = z.object({
  id,
  title: z.string().trim().min(1).max(200),
  slug,
  youtube_video_id: z.string().trim().regex(/^[A-Za-z0-9_-]{11}$/, "11-character YouTube ID").nullable().default(null),
  thumbnail: nullableUrl,
  scene: z.enum(SCENES).default("ocean"),
  category: z.enum(VIDEO_CATEGORIES).default("Court Portrait"),
  related_venue_id: id.nullable().default(null),
  related_article_id: id.nullable().default(null),
  description: nullableText,
  duration: nullableText,
  published_at: isoDate,
  published: z.boolean().default(false),
  ...timestamps,
});

export const guideSchema = z.object({
  id,
  title: z.string().trim().min(1).max(200),
  slug,
  subtitle: nullableText,
  description: nullableText,
  contents: z.array(z.string().trim().min(1).max(200)).default([]),
  includes: z.array(z.string().trim().min(1).max(200)).default([]),
  page_count: z.number().int().min(1).nullable().default(null),
  format: z.string().trim().max(60).default("PDF"),
  price: z.number().min(0).max(100000),
  currency: z.string().trim().length(3).toUpperCase().default("USD"),
  cover_image: nullableUrl,
  scene: z.enum(SCENES).default("ocean"),
  related_destination_id: id.nullable().default(null),
  /** Private storage path. Never sent to the browser. */
  downloadable_file: nullableText,
  status_note: nullableText,
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  ...timestamps,
});

export const purchaseSchema = z.object({
  id,
  guide_id: id,
  customer_email: z.string().trim().toLowerCase().email(),
  provider: z.string().trim().min(1).max(40),
  payment_reference: z.string().trim().min(1).max(200),
  payment_status: z.enum(PAYMENT_STATUSES).default("pending"),
  amount: z.number().min(0),
  currency: z.string().length(3),
  purchase_date: z.string().nullable().default(null),
  /** SHA-256 hash of the download token. The raw token is only ever shown to the buyer. */
  download_token_hash: z.string().nullable().default(null),
  download_count: z.number().int().min(0).default(0),
  download_expires_at: z.string().nullable().default(null),
  ...timestamps,
});

export const subscriberSchema = z.object({
  id,
  email: z.string().trim().toLowerCase().email(),
  source: z.string().max(80).nullable().default(null),
  ...timestamps,
});

export const inquirySchema = z.object({
  id,
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().toLowerCase().email(),
  topic: z.string().trim().max(80).default("General"),
  message: z.string().trim().min(10).max(5000),
  ...timestamps,
});

export const tableSchemas = {
  destinations: destinationSchema,
  venues: venueSchema,
  courts: courtSchema,
  facilities: facilitySchema,
  reviews: reviewSchema,
  venue_sources: sourceSchema,
  venue_images: venueImageSchema,
  articles: articleSchema,
  videos: videoSchema,
  guides: guideSchema,
  guide_purchases: purchaseSchema,
  subscribers: subscriberSchema,
  inquiries: inquirySchema,
} as const;

export type TableName = keyof typeof tableSchemas;
export type Row<T extends TableName> = z.infer<(typeof tableSchemas)[T]>;
export type Destination = Row<"destinations">;
export type Venue = Row<"venues">;
export type Court = Row<"courts">;
export type Facility = Row<"facilities">;
export type Review = Row<"reviews">;
export type VenueSource = Row<"venue_sources">;
export type VenueImage = Row<"venue_images">;
export type Article = Row<"articles">;
export type Video = Row<"videos">;
export type Guide = Row<"guides">;
export type Purchase = Row<"guide_purchases">;
export type Subscriber = Row<"subscribers">;
export type Inquiry = Row<"inquiries">;
export type Scene = (typeof SCENES)[number];
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** Child tables cascade-delete with their venue. */
export const VENUE_CHILD_TABLES = ["courts", "facilities", "reviews", "venue_sources", "venue_images"] as const;

export function parseRow<T extends TableName>(table: T, data: unknown): Row<T> {
  return tableSchemas[table].parse(data) as Row<T>;
}

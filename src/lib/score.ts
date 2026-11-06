import type { Review } from "./data/schema";

export const SCORE_CATEGORIES = [
  { key: "scenery_score", label: "Scenery" },
  { key: "tennis_quality_score", label: "Tennis quality" },
  { key: "stay_experience_score", label: "Stay experience" },
  { key: "accessibility_score", label: "Accessibility" },
  { key: "family_experience_score", label: "Family experience" },
] as const;

type Scores = Pick<Review, (typeof SCORE_CATEGORIES)[number]["key"]>;

/**
 * Tennis Escape Score: mean of the five categories (1–10), one decimal.
 * Returns null unless ALL five are present and valid — never a partial average.
 * Mirrors the generated column `reviews.overall_score` in the database.
 */
export function computeEscapeScore(r: Partial<Scores>): number | null {
  const values = SCORE_CATEGORIES.map((c) => r[c.key]);
  if (values.some((v) => v == null || !Number.isFinite(v) || v < 1 || v > 10)) return null;
  const sum = (values as number[]).reduce((a, b) => a + b, 0);
  return Math.round((sum / 5) * 10) / 10;
}

/** Only personally-visited, published reviews with a complete score count toward a venue's score. */
export function latestScoredReview<T extends Review>(reviews: T[]): (T & { overall: number }) | null {
  const scored = reviews
    .filter((r) => r.published && r.personally_visited)
    .map((r) => ({ ...r, overall: computeEscapeScore(r) }))
    .filter((r): r is T & { overall: number } => r.overall != null)
    .sort((a, b) => (b.review_date ?? "").localeCompare(a.review_date ?? ""));
  return scored[0] ?? null;
}

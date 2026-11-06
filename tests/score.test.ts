import { describe, expect, it } from "vitest";
import { computeEscapeScore, latestScoredReview } from "@/lib/score";
import type { Review } from "@/lib/data/schema";

const full = { scenery_score: 9, tennis_quality_score: 8, stay_experience_score: 7.5, accessibility_score: 6, family_experience_score: 8 };

describe("Tennis Escape Score", () => {
  it("averages all five categories to one decimal", () => {
    expect(computeEscapeScore(full)).toBe(7.7);
  });
  it("returns null when any category is missing", () => {
    expect(computeEscapeScore({ ...full, family_experience_score: null })).toBeNull();
    expect(computeEscapeScore({})).toBeNull();
  });
  it("rejects out-of-range scores", () => {
    expect(computeEscapeScore({ ...full, scenery_score: 11 })).toBeNull();
    expect(computeEscapeScore({ ...full, scenery_score: 0 })).toBeNull();
  });
  it("only counts published, personally-visited, complete reviews", () => {
    const base = { id: "x", venue_id: "v", reviewer: "Ed", overall_score: null, review_notes: null, created_at: "", updated_at: "" };
    const reviews = [
      { ...base, ...full, id: "a", review_date: "2026-01-01", personally_visited: false, published: true },
      { ...base, ...full, id: "b", review_date: "2026-02-01", personally_visited: true, published: false },
      { ...base, ...full, scenery_score: null, id: "c", review_date: "2026-03-01", personally_visited: true, published: true },
      { ...base, ...full, id: "d", review_date: "2025-12-01", personally_visited: true, published: true },
    ] as Review[];
    expect(latestScoredReview(reviews)?.id).toBe("d");
    expect(latestScoredReview(reviews.slice(0, 3))).toBeNull();
  });
});

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ENTITIES } from "@/lib/admin/entities";
import { formToRow } from "@/lib/admin/form";
import { LocalStore } from "@/lib/data/local-store";
import { StoreError } from "@/lib/data/store";

const tmp = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cs-")), "db.json");
let file = "";
afterEach(() => file && fs.rmSync(path.dirname(file), { recursive: true, force: true }));

describe("LocalStore", () => {
  it("seeds on first read and persists CRUD", async () => {
    file = tmp();
    const s = new LocalStore(file);
    expect((await s.all("venues")).length).toBe(13);
    const venue = (await s.findOne("venues", "slug", "raffles-bali"))!;
    await s.update("venues", venue.id, { ...venue, name: "Raffles Bali (edited)" });
    expect((await new LocalStore(file).get("venues", venue.id))?.name).toBe("Raffles Bali (edited)");
  });
  it("enforces unique slugs", async () => {
    file = tmp();
    const s = new LocalStore(file);
    const v = (await s.all("venues"))[0];
    await expect(s.insert("venues", { ...v, id: crypto.randomUUID() })).rejects.toBeInstanceOf(StoreError);
  });
  it("cascades venue deletion to child records", async () => {
    file = tmp();
    const s = new LocalStore(file);
    const v = (await s.findOne("venues", "slug", "raffles-bali"))!;
    await s.remove("venues", v.id);
    expect((await s.all("courts")).some((c) => c.venue_id === v.id)).toBe(false);
    expect((await s.all("venue_sources")).some((c) => c.venue_id === v.id)).toBe(false);
  });
});

describe("admin form parsing", () => {
  const fd = (o: Record<string, string | string[]>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) for (const x of [v].flat()) f.append(k, x);
    return f;
  };
  it("builds a valid destination with a generated slug", () => {
    const r = formToRow(ENTITIES.destinations, fd({ name: "Sumba Island", country: "Indonesia", scene: "ocean", experiences: ["ocean", "hidden"], published: "on" }), null);
    expect(r.errors).toBeNull();
    expect(r.row).toMatchObject({ slug: "sumba-island", experiences: ["ocean", "hidden"], published: true, featured: false, latitude: null });
  });
  it("reports required and invalid fields", () => {
    const r = formToRow(ENTITIES.venues, fd({ name: "", website: "not a url", latitude: "abc" }), null);
    expect(r.errors).toMatchObject({ name: expect.any(String), latitude: expect.any(String) });
  });
  it("refuses review scores without a personal visit", () => {
    const r = formToRow(ENTITIES.reviews, fd({ reviewer: "Ed", scenery_score: "9", venue_id: crypto.randomUUID() }), null);
    expect(r.errors?.personally_visited).toBeDefined();
  });
  it("computes the overall score — it cannot be entered by hand", () => {
    const r = formToRow<"reviews">(ENTITIES.reviews, fd({ reviewer: "Ed", personally_visited: "on", scenery_score: "9", tennis_quality_score: "8", stay_experience_score: "8", accessibility_score: "7", family_experience_score: "8", overall_score: "10", venue_id: crypto.randomUUID() }), null);
    expect(r.row?.overall_score).toBe(8);
  });
  it("extracts YouTube IDs from links", () => {
    const r = formToRow<"videos">(ENTITIES.videos, fd({ title: "Film", youtube_video_id: "https://youtu.be/dQw4w9WgXcQ", category: "Court Portrait", scene: "ocean" }), null);
    expect(r.row?.youtube_video_id).toBe("dQw4w9WgXcQ");
  });
});

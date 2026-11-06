import { tableSchemas, type Row, type TableName } from "../data/schema";
import { destinations } from "./destinations";
import { courts, facilities, venues, venueSources } from "./venues";
import { articles, guides, videos } from "./content";

export type SeedDb = { [K in TableName]: Row<K>[] };

/** Builds a fresh, schema-validated copy of the seed dataset. */
export function buildSeed(): SeedDb {
  const raw: SeedDb = {
    destinations, venues, courts, facilities, reviews: [], venue_sources: venueSources, venue_images: [],
    articles, videos, guides, guide_purchases: [], subscribers: [], inquiries: [],
  };
  const out = {} as SeedDb;
  for (const t of Object.keys(tableSchemas) as TableName[]) {
    (out as Record<string, unknown[]>)[t] = raw[t].map((r) => tableSchemas[t].parse(structuredClone(r)));
  }
  return out;
}

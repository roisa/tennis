import "server-only";
import { getStore } from "../data";
import { formatDate } from "../labels";
import type { Entity } from "./entities";

export async function loadRelations(entity: Entity) {
  const out: Record<string, [string, string][]> = {};
  for (const f of entity.fields.filter((x) => x.type === "relation")) {
    const rows = (await getStore().all(f.relation!.table)) as Record<string, unknown>[];
    out[f.name] = rows.map((r) => [String(r.id), String(r[f.relation!.label])] as [string, string]).sort((a, b) => a[1].localeCompare(b[1]));
  }
  return out;
}

export async function relationLabels() {
  const s = getStore();
  const [d, v, g] = await Promise.all([s.all("destinations"), s.all("venues"), s.all("guides")]);
  return new Map<string, string>([...d.map((x) => [x.id, x.name] as const), ...v.map((x) => [x.id, x.name] as const), ...g.map((x) => [x.id, x.title] as const)]);
}

export function cell(value: unknown, col: string, labels: Map<string, string>): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (col.endsWith("_id")) return labels.get(String(value)) ?? "—";
  if (col.endsWith("_at") || col.endsWith("_date")) return formatDate(String(value)) ?? String(value);
  if (Array.isArray(value)) return value.join(", ");
  const s = String(value).replace(/_/g, col === "url" ? "_" : " ");
  return s.length > 80 ? `${s.slice(0, 80)}…` : s;
}

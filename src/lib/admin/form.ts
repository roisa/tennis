import { ZodError } from "zod";
import { tableSchemas, type Row, type TableName } from "../data/schema";
import { slugify } from "../labels";
import { computeEscapeScore } from "../score";
import { extractYouTubeId, type Entity } from "./entities";

export type FieldErrors = Record<string, string>;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

/** Converts submitted form data to a validated row. Pure — no I/O. */
export function formToRow<T extends TableName>(
  entity: Entity,
  fd: FormData,
  existing: Record<string, unknown> | null,
  now = new Date().toISOString(),
): { row: Row<T>; errors: null } | { row: null; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const raw: Record<string, unknown> = { ...(existing ?? {}) };
  for (const f of entity.fields) {
    const v = str(fd.get(f.name));
    switch (f.type) {
      case "boolean":
        raw[f.name] = fd.get(f.name) === "on" || fd.get(f.name) === "true";
        break;
      case "tristate":
        raw[f.name] = v === "true" ? true : v === "false" ? false : null;
        break;
      case "number":
        if (!v) raw[f.name] = null;
        else if (Number.isNaN(Number(v))) errors[f.name] = "Enter a number.";
        else raw[f.name] = Number(v);
        break;
      case "multiselect":
        raw[f.name] = fd.getAll(f.name).map(String).filter(Boolean);
        break;
      case "tags":
        raw[f.name] = v ? [...new Set(v.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))] : [];
        break;
      case "lines":
        raw[f.name] = v ? v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : [];
        break;
      case "slug": {
        const from = f.slugFrom ? str(fd.get(f.slugFrom)) : "";
        raw[f.name] = v ? slugify(v) : slugify(from);
        break;
      }
      case "youtube":
        if (!v) raw[f.name] = null;
        else {
          const id = extractYouTubeId(v);
          if (!id) errors[f.name] = "Couldn't find a YouTube video ID in that link.";
          raw[f.name] = id;
        }
        break;
      case "text":
        raw[f.name] = v ? (["country_code", "rental_currency", "currency"].includes(f.name) ? v.toUpperCase() : v) : f.name === "currency" ? "USD" : null;
        break;
      default:
        raw[f.name] = v || null;
    }
    if (f.required && (raw[f.name] == null || raw[f.name] === "")) errors[f.name] = `${f.label} is required.`;
  }
  if (entity.parentField) raw[entity.parentField] = existing?.[entity.parentField] ?? str(fd.get(entity.parentField));
  raw.id = existing?.id ?? crypto.randomUUID();
  raw.created_at = existing?.created_at ?? now;
  raw.updated_at = now;

  if (entity.table === "reviews") {
    const scores = ["scenery_score", "tennis_quality_score", "stay_experience_score", "accessibility_score", "family_experience_score"];
    const hasScore = scores.some((k) => raw[k] != null);
    if (hasScore && !raw.personally_visited) errors.personally_visited = "Scores can only be recorded for a personal visit.";
    raw.overall_score = computeEscapeScore(raw as never);
  }

  // Empty inputs on non-nullable fields fall back to the schema default.
  const shape = tableSchemas[entity.table].shape as Record<string, { safeParse: (v: unknown) => { success: boolean } }>;
  for (const f of entity.fields) if (raw[f.name] == null && shape[f.name] && !shape[f.name].safeParse(null).success) delete raw[f.name];

  if (Object.keys(errors).length) return { row: null, errors };
  try {
    return { row: tableSchemas[entity.table].parse(raw) as Row<T>, errors: null };
  } catch (e) {
    if (e instanceof ZodError) {
      for (const issue of e.issues) errors[String(issue.path[0] ?? "_form")] ??= issue.message;
      return { row: null, errors };
    }
    throw e;
  }
}

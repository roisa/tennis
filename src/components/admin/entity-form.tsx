"use client";

import { useActionState, useState } from "react";
import type { Field } from "@/lib/admin/entities";
import { saveEntity, type SaveState } from "@/lib/actions/admin";
import { keepValuesOnSubmit } from "@/lib/use-keep-values";

type Props = {
  entityKey: string;
  id: string | null;
  fields: Field[];
  values: Record<string, unknown>;
  relations: Record<string, [string, string][]>;
  parent?: { field: string; id: string };
  submitLabel?: string;
};

const input = "w-full border border-charcoal/20 bg-white px-3 py-2.5 text-[14px] focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest";

function FieldInput({ f, value, error }: { f: Field; value: unknown; error?: string }) {
  const id = `fld-${f.name}`;
  const describedBy = [f.help && `${id}-h`, error && `${id}-e`].filter(Boolean).join(" ") || undefined;
  const common = { id, name: f.name, "aria-required": f.required || undefined, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy } as const;
  const [preview, setPreview] = useState<string | null>((value as string) ?? null);
  switch (f.type) {
    case "textarea":
    case "markdown":
    case "lines":
      return <textarea {...common} rows={f.type === "markdown" ? 18 : f.type === "lines" ? 6 : 4} defaultValue={Array.isArray(value) ? value.join("\n") : ((value as string) ?? "")} className={`${input} ${f.type === "markdown" ? "font-mono text-[13px]" : ""}`} />;
    case "boolean":
      return <input type="checkbox" {...common} defaultChecked={Boolean(value)} className="h-5 w-5 accent-[#152D28]" />;
    case "tristate":
      return (
        <select {...common} defaultValue={value === true ? "true" : value === false ? "false" : ""} className={input}>
          <option value="">Unknown</option><option value="true">Yes</option><option value="false">No</option>
        </select>
      );
    case "select":
      return (
        <select {...common} defaultValue={(value as string) ?? ""} className={input}>
          {!["verification_status", "venue_type", "access_type", "scene", "category"].includes(f.name) && <option value="">—</option>}
          {f.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
    case "multiselect":
      return (
        <div className="flex flex-wrap gap-x-5 gap-y-2" role="group" aria-labelledby={`${id}-l`}>
          {f.options!.map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 text-[14px] capitalize">
              <input type="checkbox" name={f.name} value={v} defaultChecked={(value as string[] | undefined)?.includes(v)} className="h-4 w-4 accent-[#152D28]" />{l}
            </label>
          ))}
        </div>
      );
    case "relation":
      return null; // rendered by parent with options
    case "image":
      return (
        <div className="space-y-2">
          <input {...common} type="url" defaultValue={(value as string) ?? ""} placeholder="https://…" className={input} onChange={(e) => setPreview(e.target.value || null)} />
          <div className="flex items-center gap-3">
            <label htmlFor={`${id}-file`} className="text-[12px] text-charcoal/60">or upload:</label>
            <input id={`${id}-file`} name={`${f.name}__file`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-[13px]" />
          </div>
          {preview && /^https?:\/\//.test(preview) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-28 w-auto border border-charcoal/10 object-cover" />
          )}
        </div>
      );
    case "tags":
      return <input {...common} defaultValue={(value as string[] | undefined)?.join(", ") ?? ""} className={input} />;
    case "number":
      return <input {...common} type="number" step={f.step ?? "any"} defaultValue={value == null ? "" : String(value)} className={input} />;
    case "date":
      return <input {...common} type="date" defaultValue={(value as string | null)?.slice(0, 10) ?? ""} className={input} />;
    case "url":
      return <input {...common} type="url" defaultValue={(value as string) ?? ""} placeholder="https://…" className={input} />;
    case "email":
      return <input {...common} type="email" defaultValue={(value as string) ?? ""} className={input} />;
    case "youtube":
      return <input {...common} defaultValue={value ? `https://www.youtube.com/watch?v=${value}` : ""} placeholder="https://www.youtube.com/watch?v=…" className={input} />;
    default:
      return <input {...common} defaultValue={(value as string) ?? ""} placeholder={f.type === "slug" ? "Generated from the name if empty" : undefined} className={input} />;
  }
}

export function EntityForm({ entityKey, id, fields, values, relations, parent, submitLabel }: Props) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveEntity.bind(null, entityKey, id), {});
  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="space-y-8" noValidate>
      {parent && <input type="hidden" name={parent.field} value={parent.id} />}
      {state.message && <p role="alert" className="border-l-4 border-red-700 bg-red-50 px-4 py-3 text-[14px] text-red-900">{state.message}</p>}
      <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
        {fields.map((f) => {
          const error = state.errors?.[f.name];
          const id = `fld-${f.name}`;
          const isCheckbox = f.type === "boolean";
          return (
            <div key={f.name} className={f.span === 2 || ["markdown", "textarea", "lines"].includes(f.type) ? "md:col-span-2" : ""}>
              {isCheckbox ? (
                <label htmlFor={id} className="flex items-center gap-3 text-[14px] font-medium text-charcoal">
                  <FieldInput f={f} value={values[f.name]} error={error} />{f.label}{f.required && <span aria-hidden className="text-red-700">*</span>}
                </label>
              ) : (
                <>
                  <label id={`${id}-l`} htmlFor={id} className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-charcoal/70">
                    {f.label}{f.required && <span aria-hidden className="text-red-700"> *</span>}
                  </label>
                  {f.type === "relation" ? (
                    <select id={id} name={f.name} defaultValue={(values[f.name] as string) ?? ""} className={input} aria-invalid={error ? true : undefined}>
                      <option value="">— None —</option>
                      {(relations[f.name] ?? []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  ) : (
                    <FieldInput f={f} value={values[f.name]} error={error} />
                  )}
                </>
              )}
              {f.help && <p id={`${id}-h`} className="mt-1 text-[12px] text-charcoal/55">{f.help}</p>}
              {error && <p id={`${id}-e`} className="mt-1 text-[13px] text-red-800">{error}</p>}
            </div>
          );
        })}
      </div>
      <div className="sticky bottom-0 -mx-6 flex items-center gap-4 border-t border-charcoal/10 bg-white/95 px-6 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className="btn-forest">{pending ? "Saving…" : submitLabel ?? "Save"}</button>
      </div>
    </form>
  );
}

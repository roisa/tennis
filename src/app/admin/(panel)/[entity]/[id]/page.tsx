import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EntityForm } from "@/components/admin/entity-form";
import { ENTITIES, getEntity } from "@/lib/admin/entities";
import { cell, loadRelations, relationLabels } from "@/lib/admin/server";
import { deleteEntity, markVerified } from "@/lib/actions/admin";
import { getStore } from "@/lib/data";
import { VERIFICATION_LABELS, formatDate } from "@/lib/labels";
import { computeEscapeScore } from "@/lib/score";

export default async function EditEntity({ params, searchParams }: { params: Promise<{ entity: string; id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { entity: key, id } = await params;
  const { saved, error } = await searchParams;
  const entity = getEntity(key);
  if (!entity) notFound();
  const row = (await getStore().get(entity.table, id)) as Record<string, unknown> | null;
  if (!row) notFound();
  const labels = await relationLabels();
  const title = String(row[entity.titleField] ?? entity.singular);
  const backHref = entity.parentField ? `/admin/venues/${row[entity.parentField]}` : `/admin/${entity.key}`;

  if (entity.readOnly) {
    return (
      <div className="max-w-3xl">
        <p className="text-[13px]"><Link href={backHref} className="underline">{entity.label}</Link> /</p>
        <h1 className="display mt-2 mb-6 text-[40px] text-forest">{title}</h1>
        <dl className="divide-y divide-charcoal/10 bg-white ring-1 ring-charcoal/10">
          {Object.entries(row).filter(([k]) => k !== "download_token_hash").map(([k, v]) => (
            <div key={k} className="grid grid-cols-[200px_1fr] gap-4 px-5 py-3 text-[14px]"><dt className="text-charcoal/55">{k.replace(/_/g, " ")}</dt><dd className="break-words whitespace-pre-wrap">{cell(v, k, labels) === "—" ? "—" : k === "message" ? String(v) : cell(v, k, labels)}</dd></div>
          ))}
        </dl>
      </div>
    );
  }

  const children = entity.children ?? [];
  const childRows = await Promise.all(children.map(async (c) => ({ e: ENTITIES[c], rows: ((await getStore().all(ENTITIES[c].table)) as Record<string, unknown>[]).filter((r) => r.venue_id === id) })));
  const publicPath = entity.publicPath?.(row);

  return (
    <div className="max-w-5xl">
      <p className="text-[13px] text-charcoal/60"><Link href={backHref} className="underline">{entity.parentField ? labels.get(String(row[entity.parentField])) : entity.label}</Link> /</p>
      <div className="mt-2 mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[44px] text-forest">{title}</h1>
        <div className="flex items-center gap-4 text-[13px]">
          {publicPath && row.published === true && <Link href={publicPath} target="_blank" className="underline">View live ↗</Link>}
          {publicPath && row.published === false && <span className="bg-amber-100 px-2 py-1 text-amber-900">Draft</span>}
          <form action={deleteEntity}>
            <input type="hidden" name="entity" value={entity.key} /><input type="hidden" name="id" value={id} />
            <ConfirmButton message={`Delete this ${entity.singular}? ${entity.key === "venues" ? "Its courts, facilities, reviews, sources and photos will also be deleted." : ""}This cannot be undone.`} className="text-red-800 underline">Delete</ConfirmButton>
          </form>
        </div>
      </div>
      {saved && <p role="status" className="mb-6 bg-lime/40 px-4 py-2 text-[14px]">{saved === "verified" ? "Verification recorded." : "Saved."}</p>}
      {error && <p role="alert" className="mb-6 bg-red-50 px-4 py-2 text-[14px] text-red-900">{error}</p>}

      {entity.key === "venues" && (
        <section className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-forest p-5 text-ivory">
          <div>
            <p className="eyebrow text-[10px] text-lime">Verification</p>
            <p className="mt-1 text-[15px]">{VERIFICATION_LABELS[row.verification_status as keyof typeof VERIFICATION_LABELS].label} · {row.last_verified_at ? `last verified ${formatDate(String(row.last_verified_at))}` : "never verified"}</p>
          </div>
          <form action={markVerified} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={id} />
            <button name="status" value="venue_verified" className="btn-lime py-2.5">Verified with venue today</button>
            <button name="status" value="public_sources" className="btn-ghost-light py-2.5">Re-checked public sources today</button>
          </form>
        </section>
      )}
      {entity.key === "reviews" && <p className="mb-6 bg-white p-4 text-[14px] ring-1 ring-charcoal/10">Tennis Escape Score: <strong>{computeEscapeScore(row as never)?.toFixed(1) ?? "— (all five categories required)"}</strong></p>}

      <div className="bg-white p-6 ring-1 ring-charcoal/10">
        <EntityForm entityKey={entity.key} id={id} fields={entity.fields} values={row} relations={await loadRelations(entity)} />
      </div>

      {childRows.map(({ e, rows }) => (
        <section key={e.key} id={e.key} className="mt-12 scroll-mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="display text-[32px] text-forest">{e.label} <span className="text-charcoal/40">({rows.length})</span></h2>
            <Link href={`/admin/${e.key}/new?venue=${id}`} className="btn-ghost-dark py-2">Add {e.singular}</Link>
          </div>
          <div className="overflow-x-auto bg-white ring-1 ring-charcoal/10">
            <table className="w-full text-left text-[14px]">
              <tbody className="divide-y divide-charcoal/10">
                {rows.map((r) => (
                  <tr key={String(r.id)}>
                    {e.listColumns.map((c, i) => <td key={c} className="px-4 py-3">{i === 0 ? <Link href={`/admin/${e.key}/${r.id}`} className="font-medium text-forest hover:underline">{cell(r[c], c, labels)}</Link> : <span className="text-charcoal/70">{c === "overall_score" ? (computeEscapeScore(r as never)?.toFixed(1) ?? "—") : cell(r[c], c, labels)}</span>}</td>)}
                  </tr>
                ))}
                {!rows.length && <tr><td className="px-4 py-6 text-charcoal/50">None yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

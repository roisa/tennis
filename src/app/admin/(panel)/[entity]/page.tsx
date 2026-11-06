import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntity } from "@/lib/admin/entities";
import { cell, relationLabels } from "@/lib/admin/server";
import { togglePublished } from "@/lib/actions/admin";
import { getStore } from "@/lib/data";

export default async function EntityList({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<{ q?: string; status?: string; deleted?: string }> }) {
  const { entity: key } = await params;
  const { q, status, deleted } = await searchParams;
  const entity = getEntity(key);
  if (!entity || entity.parentField) notFound();
  const labels = await relationLabels();
  let rows = (await getStore().all(entity.table)) as Record<string, unknown>[];
  rows = rows.slice().sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  if (q) rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const publishable = entity.fields.some((f) => f.name === "published");
  if (publishable && status === "draft") rows = rows.filter((r) => !r.published);
  if (publishable && status === "published") rows = rows.filter((r) => r.published);

  return (
    <div className="max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[52px] text-forest">{entity.label}</h1>
        {!entity.readOnly && <Link href={`/admin/${entity.key}/new`} className="btn-forest">New {entity.singular}</Link>}
        {entity.key === "subscribers" && <a href="/api/admin/export/subscribers" className="btn-ghost-dark">Export CSV</a>}
      </div>
      {deleted && <p role="status" className="mt-4 bg-lime/40 px-4 py-2 text-[14px]">Deleted.</p>}
      <form className="mt-6 flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={q} placeholder={`Search ${entity.label.toLowerCase()}`} aria-label="Search" className="w-64 border border-charcoal/20 bg-white px-3 py-2 text-[14px]" />
        {publishable && (
          <select name="status" defaultValue={status ?? ""} aria-label="Status" className="border border-charcoal/20 bg-white px-3 py-2 text-[14px]">
            <option value="">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option>
          </select>
        )}
        <button className="border border-charcoal/30 px-4 py-2 text-[13px]">Filter</button>
      </form>
      <div className="mt-6 overflow-x-auto bg-white ring-1 ring-charcoal/10">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-charcoal/10 bg-ivory/60">
            <tr>{entity.listColumns.map((c) => <th key={c} scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-charcoal/60">{c.replace(/_id$/, "").replace(/_/g, " ")}</th>)}{publishable && <th className="px-4 py-3"><span className="sr-only">Actions</span></th>}</tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {rows.map((r) => (
              <tr key={String(r.id)} className="hover:bg-ivory/40">
                {entity.listColumns.map((c, i) => (
                  <td key={c} className="max-w-[340px] px-4 py-3 align-top">
                    {i === 0 && !entity.readOnly ? <Link className="font-medium text-forest hover:underline" href={`/admin/${entity.key}/${r.id}`}>{cell(r[c], c, labels)}</Link> : i === 0 ? <Link className="font-medium text-forest hover:underline" href={`/admin/${entity.key}/${r.id}`}>{cell(r[c], c, labels)}</Link> : cell(r[c], c, labels)}
                  </td>
                ))}
                {publishable && (
                  <td className="px-4 py-3 text-right">
                    <form action={togglePublished}>
                      <input type="hidden" name="entity" value={entity.key} /><input type="hidden" name="id" value={String(r.id)} />
                      <button className="text-[12px] text-charcoal/60 underline hover:text-forest">{r.published ? "Unpublish" : "Publish"}</button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={entity.listColumns.length + 1} className="px-4 py-10 text-center text-charcoal/60">Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] text-charcoal/50">{rows.length} records</p>
    </div>
  );
}

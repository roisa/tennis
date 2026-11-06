import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/entity-form";
import { getEntity } from "@/lib/admin/entities";
import { loadRelations } from "@/lib/admin/server";
import { getStore } from "@/lib/data";

export default async function NewEntity({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<{ venue?: string }> }) {
  const { entity: key } = await params;
  const { venue } = await searchParams;
  const entity = getEntity(key);
  if (!entity || entity.readOnly) notFound();
  let parent: { field: string; id: string } | undefined;
  let parentName: string | undefined;
  if (entity.parentField) {
    const v = venue ? await getStore().get("venues", venue) : null;
    if (!v) notFound();
    parent = { field: entity.parentField, id: v.id };
    parentName = v.name;
  }
  const defaults: Record<string, unknown> = { published: false, verification_status: "unverified", coordinates_approximate: true, currency: "USD", format: "PDF", author: "COURTSCAPE Editors", sort_order: 100, accessed_at: new Date().toISOString().slice(0, 10) };
  return (
    <div className="max-w-4xl">
      <p className="text-[13px] text-charcoal/60">
        <Link href={parent ? `/admin/venues/${parent.id}` : `/admin/${entity.key}`} className="underline">{parentName ?? entity.label}</Link> /
      </p>
      <h1 className="display mt-2 mb-8 text-[44px] text-forest">New {entity.singular}</h1>
      <div className="bg-white p-6 ring-1 ring-charcoal/10">
        <EntityForm entityKey={entity.key} id={null} fields={entity.fields} values={defaults} relations={await loadRelations(entity)} parent={parent} submitLabel={`Create ${entity.singular}`} />
      </div>
    </div>
  );
}

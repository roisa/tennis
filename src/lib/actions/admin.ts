"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEntity } from "../admin/entities";
import { formToRow, type FieldErrors } from "../admin/form";
import { loginWithPassword, logout, requireAdmin } from "../auth";
import { getStore } from "../data";
import { VERIFICATION_STATUSES, type TableName } from "../data/schema";
import { StoreError } from "../data/store";
import { uploadPublicImage } from "../files";
import { isLimited, recordFailure } from "../rate-limit";

export type SaveState = { ok?: boolean; message?: string; errors?: FieldErrors };

const refreshSite = () => revalidatePath("/", "layout");

export async function loginAction(_: { error?: string }, fd: FormData): Promise<{ error?: string }> {
  if (await isLimited("admin-login", 5)) return { error: "Too many failed attempts. Try again in 15 minutes." };
  const err = await loginWithPassword(String(fd.get("email") ?? "").trim(), String(fd.get("password") ?? ""));
  if (err) {
    await recordFailure("admin-login", 15 * 60_000);
    return { error: err };
  }
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

/** Integrity rules that span records. */
async function crossChecks(table: TableName, row: Record<string, unknown>): Promise<FieldErrors | null> {
  if (table === "venues" && row.verification_status === "personally_reviewed") {
    const reviews = (await getStore().all("reviews")).filter((r) => r.venue_id === row.id && r.personally_visited && r.published);
    if (!reviews.length) return { verification_status: "Add and publish a personally-visited review before marking this venue as personally reviewed." };
  }
  return null;
}

export async function saveEntity(entityKey: string, id: string | null, _: SaveState, fd: FormData): Promise<SaveState> {
  await requireAdmin();
  const entity = getEntity(entityKey);
  if (!entity || entity.readOnly) return { message: "Unknown entity." };
  const store = getStore();
  const existing = id ? await store.get(entity.table, id) : null;
  if (id && !existing) return { message: "This record no longer exists." };

  // Handle image uploads first: an uploaded file overrides the URL field.
  for (const f of entity.fields.filter((x) => x.type === "image")) {
    const file = fd.get(`${f.name}__file`);
    if (file instanceof File && file.size > 0) {
      try {
        fd.set(f.name, await uploadPublicImage(file));
      } catch (e) {
        return { errors: { [f.name]: (e as Error).message }, message: "Image upload failed." };
      }
    }
  }

  const result = formToRow(entity, fd, existing as Record<string, unknown> | null);
  if (!result.row) return { errors: result.errors, message: "Please fix the highlighted fields." };
  if (entity.parentField) {
    const parent = await store.get("venues", String((result.row as Record<string, unknown>)[entity.parentField]));
    if (!parent) return { message: "Parent venue not found." };
  }
  const cross = await crossChecks(entity.table, result.row as Record<string, unknown>);
  if (cross) return { errors: cross, message: "Please fix the highlighted fields." };

  try {
    if (existing) await store.update(entity.table, existing.id, result.row as never);
    else await store.insert(entity.table, result.row as never);
  } catch (e) {
    if (e instanceof StoreError) return { message: e.message, errors: e.code === "conflict" && "slug" in result.row ? { slug: e.message } : undefined };
    console.error("save failed", e);
    return { message: "Saving failed. Please try again." };
  }
  refreshSite();
  if (entity.parentField) {
    const parentId = (result.row as Record<string, unknown>)[entity.parentField];
    redirect(`/admin/venues/${parentId}?saved=${entity.key}#${entity.key}`);
  }
  redirect(`/admin/${entity.key}/${result.row.id}?saved=1`);
}

export async function deleteEntity(fd: FormData) {
  await requireAdmin();
  const entity = getEntity(String(fd.get("entity")));
  const id = String(fd.get("id"));
  if (!entity || entity.readOnly) throw new Error("Unknown entity");
  const row = (await getStore().get(entity.table, id)) as Record<string, unknown> | null;
  if (!row) redirect(`/admin/${entity.key}`);
  if (entity.table === "guides" && (await getStore().all("guide_purchases")).some((p) => p.guide_id === id && ["paid", "refunded"].includes(p.payment_status))) {
    redirect(`/admin/guides/${id}?error=${encodeURIComponent("This guide has paid purchases and can't be deleted. Unpublish it instead.")}`);
  }
  await getStore().remove(entity.table, id);
  refreshSite();
  if (entity.parentField) redirect(`/admin/venues/${row[entity.parentField]}#${entity.key}`);
  redirect(`/admin/${entity.key}?deleted=1`);
}

export async function togglePublished(fd: FormData) {
  await requireAdmin();
  const entity = getEntity(String(fd.get("entity")));
  if (!entity || entity.readOnly || !entity.fields.some((f) => f.name === "published")) throw new Error("Not publishable");
  const store = getStore();
  const row = (await store.get(entity.table, String(fd.get("id")))) as Record<string, unknown> | null;
  if (!row) return;
  await store.update(entity.table, row.id as string, { ...row, published: !row.published, updated_at: new Date().toISOString() } as never);
  refreshSite();
  revalidatePath("/admin", "layout");
}

/** Records a verification check: sets the status and stamps today's date. */
export async function markVerified(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  if (!(VERIFICATION_STATUSES as readonly string[]).includes(status) || status === "personally_reviewed") throw new Error("Invalid status");
  const store = getStore();
  const v = await store.get("venues", id);
  if (!v) redirect("/admin/venues");
  await store.update("venues", id, { ...v, verification_status: status as never, last_verified_at: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() });
  refreshSite();
  redirect(`/admin/venues/${id}?saved=verified`);
}

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const PRIVATE_ROOT = path.join(process.cwd(), "private");

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Rejects absolute paths and traversal; returns a normalised relative key. */
export function safeKey(key: string): string {
  const norm = path.posix.normalize(key.replace(/\\/g, "/"));
  if (norm.startsWith("/") || norm.startsWith("..") || norm.includes("/../") || norm.includes("\0")) throw new Error("Invalid file key");
  return norm;
}

export type PrivateFile = { kind: "redirect"; url: string } | { kind: "bytes"; data: Buffer; contentType: string; filename: string };

/**
 * Private guide files. Production: Supabase Storage private bucket + 60s signed URL.
 * Development: files under ./private (never served statically).
 */
export async function getPrivateFile(key: string, downloadName: string): Promise<PrivateFile | null> {
  const k = safeKey(key);
  const sb = supabaseAdmin();
  if (sb) {
    const bucket = process.env.SUPABASE_PRIVATE_BUCKET ?? "guides-private";
    const { data, error } = await sb.storage.from(bucket).createSignedUrl(k, 60, { download: downloadName });
    if (error || !data) return null;
    return { kind: "redirect", url: data.signedUrl };
  }
  try {
    const full = path.join(PRIVATE_ROOT, k);
    if (!full.startsWith(PRIVATE_ROOT + path.sep)) return null;
    const data = await fs.readFile(full);
    return { kind: "bytes", data, contentType: k.endsWith(".pdf") ? "application/pdf" : "application/octet-stream", filename: downloadName };
  } catch {
    return null;
  }
}

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Uploads a public image (admin only). Supabase Storage public bucket, or ./public/uploads in development. */
export async function uploadPublicImage(file: File): Promise<string> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("Please upload a JPEG, PNG, WebP or AVIF image.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Images must be 8 MB or smaller.");
  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const sb = supabaseAdmin();
  if (sb) {
    const bucket = process.env.SUPABASE_PUBLIC_BUCKET ?? "media";
    const { error } = await sb.storage.from(bucket).upload(name, buf, { contentType: file.type, upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return sb.storage.from(bucket).getPublicUrl(name).data.publicUrl;
  }
  const dir = path.join(process.cwd(), "public", "uploads", path.dirname(name));
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(process.cwd(), "public", "uploads", name), buf);
  } catch {
    throw new Error("Image storage isn't configured. Set up Supabase Storage to upload images.");
  }
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/uploads/${name}`;
}

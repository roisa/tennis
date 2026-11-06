import { NextResponse } from "next/server";
import { getPrivateFile } from "@/lib/files";
import { recordDownload, resolveDownload } from "@/lib/purchases";

export const dynamic = "force-dynamic";

const deny = (status: number, msg: string) =>
  new NextResponse(msg, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex", "Content-Type": "text/plain; charset=utf-8" } });

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const access = await resolveDownload(token);
  if (!access.ok) return deny(access.reason === "invalid" ? 404 : 403, "Download not available.");
  const name = `${access.guide.slug}${access.isTest ? "-TEST-SAMPLE" : ""}.pdf`;
  const file = await getPrivateFile(access.file, name);
  if (!file) return deny(404, "File not found.");
  await recordDownload(access.purchase);
  if (file.kind === "redirect") return NextResponse.redirect(file.url, { status: 303, headers: { "Cache-Control": "no-store" } });
  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

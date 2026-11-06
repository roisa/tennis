import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getStore } from "@/lib/data";

export const dynamic = "force-dynamic";

const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`;

export async function GET() {
  if (!(await getAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const rows = await getStore().all("subscribers");
  const body = ["email,source,created_at", ...rows.map((r) => [r.email, r.source, r.created_at].map(csv).join(","))].join("\n");
  return new NextResponse(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="subscribers.csv"', "Cache-Control": "no-store" } });
}

import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic admin gate: bounces requests without any session cookie to the login page.
 * Real authorisation happens server-side in requireAdmin() on every admin page and action.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const hasSession = req.cookies.has("cs_admin") || req.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
  if (!hasSession) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };

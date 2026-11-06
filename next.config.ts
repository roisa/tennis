import type { NextConfig } from "next";

/**
 * Two build targets:
 *  - Full-stack (default): Vercel/Node — admin, checkout, downloads, forms, ISR.
 *  - Static preview (STATIC_EXPORT=1): GitHub Pages — public magazine & directory only.
 *    Routes named `*.server.tsx|ts` (admin, API, checkout, downloads, OG, proxy) are excluded,
 *    and form actions are swapped for client-side stubs.
 */
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const remotePatterns = [
  { protocol: "https" as const, hostname: "images.unsplash.com" },
  { protocol: "https" as const, hostname: "res.cloudinary.com" },
  { protocol: "https" as const, hostname: "*.supabase.co" },
  { protocol: "https" as const, hostname: "i.ytimg.com" },
];

const staticConfig: NextConfig = {
  output: "export",
  env: { NEXT_PUBLIC_STATIC_EXPORT: "1", NEXT_PUBLIC_BASE_PATH: basePath },
  basePath,
  trailingSlash: true,
  poweredByHeader: false,
  pageExtensions: ["tsx", "ts"],
  images: { unoptimized: true, remotePatterns },
  turbopack: {
    resolveAlias: {
      "@/lib/actions/public": "./src/lib/actions/public.static.ts",
      "@/lib/actions/checkout": "./src/lib/actions/checkout.static.ts",
    },
  },
};

const fullConfig: NextConfig = {
  env: { NEXT_PUBLIC_STATIC_EXPORT: "", NEXT_PUBLIC_BASE_PATH: "" },
  poweredByHeader: false,
  pageExtensions: ["tsx", "ts", "server.tsx", "server.ts"],
  // Private guide files are read from disk by the download route in non-Supabase deployments.
  outputFileTracingIncludes: { "/api/download/[token]": ["./private/**/*"] },
  images: { remotePatterns },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/downloads/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default isStatic ? staticConfig : fullConfig;

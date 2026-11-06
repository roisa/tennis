import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const allow = process.env.ALLOW_INDEXING !== "false";
  return {
    rules: allow
      ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/downloads/", "/guides/checkout/", "/*/success"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./site";

type MetaInput = { title?: string; description?: string; path: string; image?: string | null; type?: "website" | "article"; noindex?: boolean; publishedTime?: string | null };

export function pageMetadata({ title, description = SITE.description, path, image, type = "website", noindex, publishedTime }: MetaInput): Metadata {
  const ogImage = image ?? absoluteUrl(`/og?title=${encodeURIComponent(title ?? SITE.tagline)}`);
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type, url: absoluteUrl(path), title: title ?? `${SITE.name} — ${SITE.tagline}`, description, siteName: SITE.name, locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title ?? SITE.name }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: title ?? SITE.name, description, images: [ogImage] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

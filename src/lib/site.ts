export const SITE = {
  name: "COURTSCAPE",
  tagline: "Beyond the Court.",
  positioning: "Discover. Play. Explore.",
  description: "COURTSCAPE discovers extraordinary places around the world where tennis meets travel — beautiful courts, resorts, destinations and tennis holidays.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@courtscape.example",
  partnershipsEmail: process.env.NEXT_PUBLIC_PARTNERS_EMAIL ?? "partners@courtscape.example",
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? null,
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL ?? null,
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? null,
  },
};

export const NAV = [
  { href: "/discover", label: "Discover" },
  { href: "/destinations", label: "Destinations" },
  { href: "/courts", label: "Courts" },
  { href: "/stay-and-play", label: "Stay & Play" },
  { href: "/journal", label: "Journal" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
] as const;

export const absoluteUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

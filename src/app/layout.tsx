import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { JsonLd } from "@/components/json-ld";
import { SITE, absoluteUrl } from "@/lib/site";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Beyond the Court. Tennis Travel & Destinations`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { siteName: SITE.name, type: "website", locale: "en_US", url: absoluteUrl("/"), images: [{ url: absoluteUrl("/og"), width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image" },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
};

export const viewport: Viewport = { themeColor: "#152D28", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a href="#main" className="sr-only z-[100] bg-lime px-4 py-2 text-forest focus:not-sr-only focus:fixed focus:top-2 focus:left-2">Skip to content</a>
        {children}
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: absoluteUrl("/icon.svg"), slogan: SITE.tagline }} />
        <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url, potentialAction: { "@type": "SearchAction", target: `${SITE.url}/courts?q={search_term_string}`, "query-input": "required name=search_term_string" } }} />
        <Analytics />
      </body>
    </html>
  );
}

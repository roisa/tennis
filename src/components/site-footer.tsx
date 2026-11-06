import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import { Wordmark } from "./logo";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const social = Object.entries(SITE.social).filter(([, url]) => url) as [string, string][];
  return (
    <footer className="bg-forest text-ivory">
      <div className="container-x grid gap-14 border-b border-ivory/10 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-5">
          <Wordmark />
          <p className="display mt-8 text-[44px] text-ivory sm:text-[56px]">Beyond the court.</p>
          <p className="mt-4 max-w-md text-ivory/70">{SITE.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-4">
          <div>
            <h2 className="eyebrow mb-5 text-lime">Explore</h2>
            <ul className="space-y-3 text-[15px] text-ivory/80">
              {NAV.map((n) => <li key={n.href}><Link className="link-underline hover:text-ivory" href={n.href}>{n.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow mb-5 text-lime">More</h2>
            <ul className="space-y-3 text-[15px] text-ivory/80">
              <li><Link className="link-underline" href="/films">Films</Link></li>
              <li><Link className="link-underline" href="/journal/tennis-escape-score-how-we-rate">Our ratings</Link></li>
              <li><Link className="link-underline" href="/contact">Contact</Link></li>
              <li><Link className="link-underline" href="/contact?topic=Partnerships">Partnerships</Link></li>
              <li><Link className="link-underline" href="/privacy">Privacy</Link></li>
              <li><Link className="link-underline" href="/terms">Terms</Link></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h2 className="eyebrow mb-5 text-lime">Contact</h2>
            <ul className="space-y-3 text-[15px] text-ivory/80">
              <li><a className="link-underline break-all" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              {social.length ? social.map(([k, url]) => <li key={k}><a className="link-underline capitalize" href={url} rel="noopener noreferrer" target="_blank">{k}</a></li>) : <li className="text-ivory/40">Social channels launching soon</li>}
            </ul>
          </div>
        </div>
        <div className="lg:col-span-3">
          <h2 className="eyebrow mb-5 text-lime">The Dispatch</h2>
          <NewsletterForm source="footer" />
        </div>
      </div>
      <div className="container-x flex flex-col gap-3 py-8 text-xs text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} COURTSCAPE. {SITE.positioning}</p>
        <p>Listings are labelled by how they were verified. Always confirm details with venues before travelling.</p>
      </div>
    </footer>
  );
}

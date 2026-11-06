import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata = pageMetadata({ title: "Contact & Partnerships", description: "Contact COURTSCAPE about partnerships, venue updates, press and guides.", path: "/contact" });

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string; venue?: string }> }) {
  const { topic, venue } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk tennis." intro="Partnerships, venue updates, press or a court we should see — we read everything." />
      <section className="container-x grid gap-16 py-20 lg:grid-cols-12">
        <div className="lg:col-span-7"><ContactForm topic={topic} venue={venue?.slice(0, 200)} /></div>
        <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
          <div><p className="eyebrow mb-2 text-forest/60">Editorial</p><a className="link-underline text-lg text-forest" href={`mailto:${SITE.email}`}>{SITE.email}</a></div>
          <div><p className="eyebrow mb-2 text-forest/60">Partnerships</p><a className="link-underline text-lg text-forest" href={`mailto:${SITE.partnershipsEmail}`}>{SITE.partnershipsEmail}</a>
            <p className="mt-3 text-[15px] text-charcoal/70">For resorts, hotels, clubs and tourism boards. Partnerships are always disclosed and never influence our scores.</p></div>
          <div><p className="eyebrow mb-2 text-forest/60">Venue owners</p><p className="text-[15px] text-charcoal/70">Help us verify your listing: send court details, surfaces, access rules and booking contacts, with a link to where they&rsquo;re published.</p></div>
        </aside>
      </section>
    </>
  );
}

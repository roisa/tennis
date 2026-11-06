import Link from "next/link";
import { Media } from "@/components/media";
import { PageHero } from "@/components/ui";
import { EXPERIENCES_META, VERIFICATION_LABELS } from "@/lib/labels";
import { searchVenues } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import type { VerificationStatus } from "@/lib/data/schema";

export const revalidate = 300;
export const metadata = pageMetadata({
  title: "Discover Tennis Escapes by Experience",
  description: "Mountain courts, ocean views, jungle escapes, luxury resorts, hidden gems and city tennis — discover tennis travel by the experience you want.",
  path: "/discover",
});

export default async function DiscoverPage() {
  const all = await searchVenues({});
  const count = (k: string) => all.filter((v) => v.venue.experiences.includes(k as never)).length;
  return (
    <>
      <PageHero eyebrow="Discover" title="Start with a feeling." intro="Some trips begin with a place. Ours begin with a setting: thin mountain air, a sea breeze across the net, a court hidden in the green." />
      <section className="container-x py-20" aria-label="Experiences">
        <ul className="grid gap-6 md:grid-cols-2">
          {EXPERIENCES_META.map((e, i) => (
            <li key={e.key}>
              <Link href={`/courts?experience=${e.key}`} className="group relative block overflow-hidden bg-forest text-ivory">
                <div className="relative aspect-[16/10]">
                  <Media alt={e.label} scene={e.scene} seed={`discover-${e.key}`} sizes="(min-width:768px) 50vw, 100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/90 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-8">
                    <div>
                      <p className="eyebrow text-ivory/50">{String(i + 1).padStart(2, "0")}</p>
                      <h2 className="display mt-2 text-[44px] md:text-[56px]">{e.label}</h2>
                      <p className="mt-2 max-w-sm text-ivory/75">{e.blurb}</p>
                    </div>
                    <span className="eyebrow shrink-0 text-lime">{count(e.key) ? `${count(e.key)} venues →` : "Coming soon"}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="bg-forest py-20 text-ivory" aria-labelledby="trust">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4 text-lime">Our promise</p>
            <h2 id="trust" className="display text-[52px]">We tell you how we know.</h2>
            <p className="mt-5 text-ivory/70">Every venue carries a verification label and the date it was last checked. Scores come only from our own visits.</p>
            <Link href="/journal/tennis-escape-score-how-we-rate" className="btn-lime mt-8">How we rate courts</Link>
          </div>
          <dl className="grid gap-px bg-ivory/10 sm:grid-cols-2 lg:col-span-7">
            {(Object.keys(VERIFICATION_LABELS) as VerificationStatus[]).map((k) => (
              <div key={k} className="bg-forest p-6">
                <dt className="font-semibold text-lime">{VERIFICATION_LABELS[k].label}</dt>
                <dd className="mt-2 text-[14px] text-ivory/70">{VERIFICATION_LABELS[k].description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

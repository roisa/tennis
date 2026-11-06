import Link from "next/link";
import { ArticleCard, DestinationCard, GuideCard, VenueCard, VideoCard } from "@/components/cards";
import { Media } from "@/components/media";
import { NewsletterForm } from "@/components/newsletter-form";
import { SectionHeading } from "@/components/ui";
import { EXPERIENCES_META, SURFACE_LABELS } from "@/lib/labels";
import { getArticles, getDestinationsWithCounts, getFeaturedVenues, getGuides, getStayAndPlay, getVideos, publicGuide } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "COURTSCAPE — Beyond the Court. Tennis Travel & Destinations",
  description: "Discover extraordinary places to play tennis, stay longer and experience the world differently. Tennis courts, resorts and destinations from Bali to the Alps.",
  path: "/",
});

export default async function HomePage() {
  const [destinations, venues, articles, stays, videos, guides] = await Promise.all([
    getDestinationsWithCounts(), getFeaturedVenues(6), getArticles(), getStayAndPlay(), getVideos(), getGuides(),
  ]);
  const featuredDest = destinations.filter((d) => d.destination.featured).slice(0, 6);
  const [leadArticle, ...moreArticles] = articles;

  return (
    <>
      {/* 1 — HERO */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest text-ivory" aria-labelledby="hero-title">
        <Media alt="A tennis court on a tropical clifftop above the ocean at golden hour" scene="cliff" seed="hero" surface="hard" priority zoom={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/55 to-forest/20 md:via-forest/35 md:to-forest/10" />
        <div className="container-x relative pt-40 pb-14 md:pb-20">
          <p className="eyebrow rise mb-6 text-lime">Tennis × Travel — Issue 01: Indonesia</p>
          <h1 id="hero-title" className="display rise-2 text-[18vw] leading-[0.82] sm:text-[15vw] lg:text-[13vw] xl:text-[188px]">
            Beyond<br /><em className="text-lime">the court.</em>
          </h1>
          <div className="rise-3 mt-10 grid gap-8 md:grid-cols-12 md:items-end">
            <p className="max-w-xl text-lg leading-relaxed text-ivory/85 md:col-span-6 md:text-xl">
              Discover extraordinary places to play tennis, stay longer and experience the world differently.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row md:col-span-6 md:justify-end">
              <Link href="/destinations" className="btn-lime">Explore destinations <span aria-hidden>→</span></Link>
              <Link href="/journal" className="btn-ghost-light">Discover the journal</Link>
            </div>
          </div>
          <p className="eyebrow mt-12 text-[9px] text-ivory/40">Illustrated preview — commissioned photography in production</p>
        </div>
      </section>

      {/* 2 — FEATURED DESTINATIONS */}
      <section className="container-x py-24 md:py-32" aria-labelledby="dest-title">
        <SectionHeading id="dest-title" eyebrow="Featured destinations" title="Where tennis meets the horizon." intro="Our first editorial focus is Indonesia — then outwards to the lagoons, the Alps and Japan." href="/destinations" cta="All destinations" />
        <div className="grid gap-4 md:grid-cols-12 md:gap-6">
          {featuredDest.map((d, i) => (
            <div key={d.destination.id} className={i === 0 ? "md:col-span-7" : i === 1 ? "md:col-span-5" : "md:col-span-6 lg:col-span-3"}>
              <DestinationCard destination={d.destination} venueCount={d.venueCount} index={i} size={i < 2 ? "lg" : "md"} frame={i < 2 ? "aspect-[4/5] md:aspect-auto md:h-[620px]" : "aspect-[4/5]"} />
            </div>
          ))}
        </div>
      </section>

      {/* 3 — EXPLORE BY EXPERIENCE */}
      <section className="bg-ivory-2 py-24 md:py-32" aria-labelledby="exp-title">
        <div className="container-x">
          <SectionHeading id="exp-title" eyebrow="Explore by experience" title="Choose your setting." />
          <ul className="grid grid-cols-2 gap-px bg-forest/15 md:grid-cols-3 lg:grid-cols-6">
            {EXPERIENCES_META.map((e) => (
              <li key={e.key} className="bg-ivory-2">
                <Link href={`/courts?experience=${e.key}`} className="group block p-4 sm:p-5">
                  <div className="relative aspect-[3/4] overflow-hidden"><Media alt={e.label} scene={e.scene} seed={`exp-${e.key}`} sizes="(min-width: 1024px) 16vw, 50vw" /></div>
                  <h3 className="display mt-4 text-[26px] text-forest">{e.label}</h3>
                  <p className="mt-1 text-[13px] leading-snug text-charcoal/65">{e.blurb}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 — FEATURED COURTS */}
      <section className="container-x py-24 md:py-32" aria-labelledby="courts-title">
        <SectionHeading id="courts-title" eyebrow="Featured courts" title="Courts worth the journey." intro="Every listing shows how we know what we know. Scores appear only after we've played there." href="/courts" cta="Search all courts" />
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => <VenueCard key={v.venue.id} item={v} />)}
        </div>
      </section>

      {/* 5 — LATEST JOURNAL */}
      {leadArticle && (
        <section className="border-t border-forest/10 bg-white py-24 md:py-32" aria-labelledby="journal-title">
          <div className="container-x">
            <SectionHeading id="journal-title" eyebrow="The Journal" title="Stories from the baseline." href="/journal" cta="Read the journal" />
            <ArticleCard article={leadArticle} layout="feature" />
            <div className="mt-16 grid gap-x-10 md:grid-cols-2">
              {moreArticles.slice(0, 4).map((a) => <ArticleCard key={a.id} article={a} layout="row" />)}
            </div>
          </div>
        </section>
      )}

      {/* 6 — STAY & PLAY */}
      <section className="bg-forest py-24 text-ivory md:py-32" aria-labelledby="stay-title">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading id="stay-title" tone="light" eyebrow="Stay & Play" title="Sleep steps from the court." intro="Resorts and hotels where tennis is part of the stay — from clifftop villas to Alpine grand hotels." href="/stay-and-play" cta="All stays" />
          </div>
          <ol className="lg:col-span-7">
            {stays.slice(0, 6).map((s, i) => (
              <li key={s.venue.id} className="group relative grid grid-cols-[auto_1fr_auto] items-baseline gap-5 border-t border-ivory/15 py-6">
                <span className="eyebrow text-ivory/40">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="display text-[30px] leading-tight sm:text-[36px]"><Link href={`/courts/${s.venue.slug}`} className="after:absolute after:inset-0 group-hover:text-lime">{s.venue.name}</Link></h3>
                  <p className="mt-1 text-[14px] text-ivory/60">{[s.venue.city, s.destination?.name].filter(Boolean).join(", ")}</p>
                </div>
                <span className="eyebrow hidden text-[10px] text-ivory/60 sm:block">{s.surfaces.map((x) => SURFACE_LABELS[x]).join(" · ") || "Surface TBC"}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7 — COURTSCAPE FILMS */}
      <section className="bg-charcoal py-24 text-ivory md:py-32" aria-labelledby="films-title">
        <div className="container-x">
          <SectionHeading id="films-title" tone="light" eyebrow="COURTSCAPE Films" title="Watch the places." intro="Short films from the courts we visit. Our first films are in production." href="/films" cta="All films" />
          <div className="grid gap-10 md:grid-cols-3">
            {videos.slice(0, 3).map(({ video }) => <VideoCard key={video.id} video={video} />)}
          </div>
        </div>
      </section>

      {/* 8 — TRAVEL GUIDES */}
      <section className="container-x py-24 md:py-32" aria-labelledby="guides-title">
        <SectionHeading id="guides-title" eyebrow="Travel guides" title="Take COURTSCAPE with you." intro="Beautifully designed digital guides for planning a tennis escape." href="/guides" cta="All guides" />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => { const pg = publicGuide(g); return <GuideCard key={g.id} guide={pg} available={pg.available} />; })}
        </div>
      </section>

      {/* 9 — NEWSLETTER */}
      <section className="bg-lime py-24 md:py-32" aria-labelledby="nl-title">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:items-end">
          <h2 id="nl-title" className="display text-[52px] text-forest sm:text-[80px] lg:col-span-7 lg:text-[104px]">Your next tennis escape starts here.</h2>
          <div className="lg:col-span-5">
            <p className="mb-6 text-lg text-forest/80">New destinations, newly verified courts and stories from the road — delivered occasionally, never noisily.</p>
            <NewsletterForm source="home" tone="light" />
          </div>
        </div>
      </section>
    </>
  );
}

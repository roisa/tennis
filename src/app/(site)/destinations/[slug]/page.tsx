import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard, GuideCard, VenueCard } from "@/components/cards";
import { MapLoader } from "@/components/map-loader";
import { Media } from "@/components/media";
import { Breadcrumbs, EmptyState } from "@/components/ui";
import { toMapPoints } from "@/lib/map-points";
import { getDestinationBySlug, getDestinations, publicGuide } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getDestinations()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getDestinationBySlug((await params).slug);
  if (!data) return {};
  const d = data.destination;
  return pageMetadata({ title: `Tennis in ${d.name} — Courts, Resorts & Guides`, description: d.tagline ?? d.description ?? undefined, path: `/destinations/${d.slug}`, image: d.cover_image });
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getDestinationBySlug((await params).slug);
  if (!data) notFound();
  const { destination: d, venues, articles, guides } = data;
  const points = toMapPoints(venues);
  return (
    <>
      <header className="relative isolate overflow-hidden bg-forest text-ivory">
        <div className="relative h-[78vh] min-h-[520px]">
          <Media src={d.cover_image} alt={d.cover_alt ?? `Tennis court in ${d.name}`} scene={d.scene} seed={d.slug} priority zoom={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/25 to-forest/10" />
          <div className="container-x absolute inset-x-0 bottom-0 pb-14">
            <Breadcrumbs tone="light" items={[{ name: "Home", path: "/" }, { name: "Destinations", path: "/destinations" }, { name: d.name, path: `/destinations/${d.slug}` }]} />
            <p className="eyebrow mt-8 text-lime">{d.country}{d.region && d.region !== d.country ? ` · ${d.region}` : ""}</p>
            <h1 className="display mt-3 text-[80px] sm:text-[120px] lg:text-[168px]">{d.name}</h1>
            {d.tagline && <p className="mt-2 max-w-2xl text-xl text-ivory/80">{d.tagline}</p>}
          </div>
        </div>
      </header>

      <section className="container-x grid gap-12 py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-5 text-forest/60">The destination</p>
          {d.description?.split(/\n{2,}/).map((p, i) => <p key={i} className="mb-5 text-[19px] leading-relaxed text-charcoal/85">{p}</p>)}
        </div>
        <dl className="grid grid-cols-2 content-start gap-px bg-forest/15 lg:col-span-4 lg:col-start-9">
          <div className="bg-ivory p-6"><dt className="eyebrow text-[10px] text-forest/50">Venues listed</dt><dd className="display mt-2 text-[48px] text-forest">{venues.length}</dd></div>
          <div className="bg-ivory p-6"><dt className="eyebrow text-[10px] text-forest/50">Reviewed</dt><dd className="display mt-2 text-[48px] text-forest">{venues.filter((v) => v.score != null).length}</dd></div>
          <div className="col-span-2 bg-ivory p-6"><dt className="eyebrow text-[10px] text-forest/50">Status</dt><dd className="mt-2 text-[15px] text-charcoal/80">{venues.some((v) => v.score != null) ? "Includes COURTSCAPE-reviewed venues." : "Research in progress — listings are labelled by source."}</dd></div>
        </dl>
      </section>

      <section className="container-x pb-20" aria-labelledby="dv-h">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 id="dv-h" className="display text-[48px] text-forest md:text-[64px]">Courts in {d.name}</h2>
          {venues.length > 0 && <Link href={`/courts?destination=${d.slug}`} className="eyebrow link-underline text-forest">Filter these courts →</Link>}
        </div>
        {venues.length ? (
          <>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{venues.map((v) => <VenueCard key={v.venue.id} item={v} />)}</div>
            {points.length > 0 && <div className="mt-16"><MapLoader points={points} className="h-[440px]" /></div>}
          </>
        ) : (
          <EmptyState title="Research in progress." body={`We're still sourcing tennis venues in ${d.name}. Know a court we should see?`} action={<Link href="/contact?topic=Venue%20update" className="btn-forest">Suggest a court</Link>} />
        )}
      </section>

      {(articles.length > 0 || guides.length > 0) && (
        <section className="border-t border-forest/10 bg-white py-20">
          <div className="container-x grid gap-16 lg:grid-cols-12">
            {articles.length > 0 && (
              <div className="lg:col-span-8">
                <h2 className="eyebrow mb-8 text-forest">From the journal</h2>
                <div>{articles.map((a) => <ArticleCard key={a.id} article={a} layout="row" />)}</div>
              </div>
            )}
            {guides.length > 0 && (
              <div className="lg:col-span-4">
                <h2 className="eyebrow mb-8 text-forest">Guide</h2>
                {guides.map((g) => { const pg = publicGuide(g); return <GuideCard key={g.id} guide={pg} available={pg.available} />; })}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

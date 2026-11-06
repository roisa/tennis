import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard, VenueCard } from "@/components/cards";
import { JsonLd } from "@/components/json-ld";
import { MapLoader } from "@/components/map-loader";
import { Media } from "@/components/media";
import { Breadcrumbs, LastVerified, ScoreBadge, VerificationBadge } from "@/components/ui";
import { ACCESS_LABELS, INDOOR_LABELS, SETTING_LABELS, SURFACE_LABELS, VENUE_TYPE_LABELS, VERIFICATION_LABELS, formatDate, formatPrice } from "@/lib/labels";
import { toMapPoints } from "@/lib/map-points";
import { getSitemapData, getVenueBySlug } from "@/lib/queries";
import { SCORE_CATEGORIES } from "@/lib/score";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

export async function generateStaticParams() {
  const { venues } = await getSitemapData();
  return venues.map((v) => ({ slug: v.venue.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getVenueBySlug((await params).slug);
  if (!data) return {};
  const { venue: v, destination: d } = data;
  return pageMetadata({
    title: `${v.name} — Tennis in ${d?.name ?? v.city ?? ""}`.trim(),
    description: v.summary ?? `Tennis at ${v.name}: courts, surfaces, access and how to book.`,
    path: `/courts/${v.slug}`,
    image: v.cover_image,
  });
}

const yesNo = (b: boolean | null) => (b == null ? null : b ? "Yes" : "No");

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getVenueBySlug((await params).slug);
  if (!data) notFound();
  const { venue: v, destination: d, courts, facilities, reviews, sources, images, articles, videos, nearby, surfaces } = data;
  const latest = reviews.find((r) => r.personally_visited && r.overall != null);
  const verification = VERIFICATION_LABELS[v.verification_status];
  const location = [v.city, d?.name, d && d.country !== d.name ? d.country : null].filter(Boolean).join(", ");
  const points = toMapPoints([data]);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Courts", path: "/courts" },
    ...(d ? [{ name: d.name, path: `/destinations/${d.slug}` }] : []),
    { name: v.name, path: `/courts/${v.slug}` },
  ];

  const ldType = v.venue_type === "resort" ? "Resort" : v.venue_type === "hotel" ? "Hotel" : "SportsActivityLocation";
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ldType,
    name: v.name,
    url: absoluteUrl(`/courts/${v.slug}`),
    ...(v.website ? { sameAs: [v.website] } : {}),
    ...(v.summary ? { description: v.summary } : {}),
    ...(v.address ? { address: { "@type": "PostalAddress", streetAddress: v.address, addressCountry: d?.country_code ?? undefined } } : d ? { address: { "@type": "PostalAddress", addressLocality: v.city ?? undefined, addressCountry: d.country_code ?? undefined } } : {}),
    ...(!v.coordinates_approximate && v.latitude != null ? { geo: { "@type": "GeoCoordinates", latitude: v.latitude, longitude: v.longitude } } : {}),
    ...(v.phone ? { telephone: v.phone } : {}),
  };

  return (
    <article>
      <JsonLd data={ld} />
      <header className="relative isolate overflow-hidden bg-forest text-ivory">
        <div className="relative h-[62vh] min-h-[420px]">
          <Media src={v.cover_image} alt={v.cover_alt ?? `${v.name} tennis court`} scene={v.scene} seed={v.slug} surface={surfaces[0]} priority zoom={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-forest/10" />
        </div>
        <div className="container-x relative -mt-56 pb-12 md:-mt-64">
          <Breadcrumbs items={crumbs} tone="light" />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <VerificationBadge status={v.verification_status} />
            <span className="eyebrow text-[10px] text-ivory/60"><LastVerified date={v.last_verified_at} /></span>
          </div>
          <h1 className="display mt-5 max-w-5xl text-[52px] sm:text-[80px] lg:text-[104px]">{v.name}</h1>
          <p className="eyebrow mt-4 text-lime">{location}</p>
        </div>
      </header>

      <div className="container-x grid gap-16 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          {v.summary && <p className="display text-[30px] leading-snug text-forest md:text-[38px]">{v.summary}</p>}
          {v.description && <div className="prose-cs mt-8">{v.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>}

          <section className="mt-16" aria-labelledby="courts-h">
            <h2 id="courts-h" className="eyebrow mb-6 text-forest">The courts</h2>
            {courts.length ? (
              <div className="divide-y divide-forest/15 border-y border-forest/15">
                {courts.map((c) => {
                  const rows: [string, string | null][] = [
                    ["Surface", c.surface ? SURFACE_LABELS[c.surface] : null],
                    ["Courts", c.court_count != null ? String(c.court_count) : null],
                    ["Indoor / outdoor", c.indoor_outdoor ? INDOOR_LABELS[c.indoor_outdoor] : null],
                    ["Covered", yesNo(c.covered)],
                    ["Floodlights", yesNo(c.lighting)],
                    ["Court hire", c.rental_price != null && c.rental_currency ? `${formatPrice(c.rental_price, c.rental_currency)} / hour` : null],
                  ];
                  return (
                    <div key={c.id} className="py-6" data-testid="court-row">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="display text-[28px] text-forest">{c.court_name}</h3>
                        <VerificationBadge status={c.verification_status} short />
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] sm:grid-cols-3">
                        {rows.map(([k, val]) => (
                          <div key={k}>
                            <dt className="eyebrow text-[10px] text-forest/50">{k}</dt>
                            <dd className={val ? "mt-1 text-charcoal" : "mt-1 text-charcoal/45 italic"}>{val ?? "Not confirmed"}</dd>
                          </div>
                        ))}
                      </dl>
                      {c.booking_requirements && <p className="mt-4 text-[14px] text-charcoal/75"><span className="eyebrow mr-2 text-[10px] text-forest/50">Booking</span>{c.booking_requirements}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-charcoal/60">Court details have not been confirmed yet.</p>
            )}
          </section>

          {facilities.length > 0 && (
            <section className="mt-16" aria-labelledby="fac-h">
              <h2 id="fac-h" className="eyebrow mb-6 text-forest">Facilities</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {facilities.map((f) => (
                  <li key={f.id} className="border-t border-forest/15 pt-4">
                    <p className="font-semibold text-forest">{f.name}</p>
                    {f.description && <p className="mt-1 text-[14px] text-charcoal/70">{f.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {images.length > 0 && (
            <section className="mt-16" aria-labelledby="gal-h">
              <h2 id="gal-h" className="eyebrow mb-6 text-forest">Photographs</h2>
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, i) => (
                  <figure key={img.id} className={i === 0 ? "col-span-2" : ""}>
                    <div className={`relative ${i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"} overflow-hidden bg-ivory-2`}>
                      <Image src={img.url} alt={img.alt} fill sizes="(min-width:1024px) 50vw, 100vw" unoptimized={img.url.includes("/uploads/")} className="object-cover" />
                    </div>
                    {img.credit && <figcaption className="mt-2 text-xs text-stone">{img.credit}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          )}

          <section className="mt-16" aria-labelledby="score-h">
            <h2 id="score-h" className="eyebrow mb-6 text-forest">Tennis Escape Score</h2>
            {latest ? (
              <div className="bg-forest p-8 text-ivory md:p-10">
                <ScoreBadge score={latest.overall} size="lg" />
                <dl className="mt-8 grid gap-4 sm:grid-cols-5">
                  {SCORE_CATEGORIES.map((c) => (
                    <div key={c.key} className="border-t border-ivory/15 pt-3">
                      <dt className="eyebrow text-[10px] text-ivory/60">{c.label}</dt>
                      <dd className="display mt-1 text-[32px] text-ivory">{latest[c.key]?.toFixed(1)}</dd>
                    </div>
                  ))}
                </dl>
                {latest.review_notes && <p className="mt-8 max-w-2xl text-ivory/80">{latest.review_notes}</p>}
                <p className="eyebrow mt-6 text-[10px] text-lime">Personally reviewed by {latest.reviewer}{latest.review_date && ` · ${formatDate(latest.review_date)}`}</p>
              </div>
            ) : (
              <div className="border border-dashed border-forest/30 p-8">
                <p className="display text-[34px] text-forest">Not yet reviewed.</p>
                <p className="mt-3 max-w-xl text-charcoal/70">
                  We only publish a Tennis Escape Score after a COURTSCAPE editor has visited and played here.{" "}
                  <Link className="underline decoration-lime-2 decoration-2 underline-offset-4" href="/journal/tennis-escape-score-how-we-rate">How we rate courts</Link>.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="space-y-10 lg:sticky lg:top-24">
            <section className="bg-white p-7 ring-1 ring-forest/10" aria-labelledby="facts-h">
              <h2 id="facts-h" className="eyebrow mb-5 text-forest">At a glance</h2>
              <dl className="divide-y divide-forest/10 text-[14px]">
                {([
                  ["Venue type", VENUE_TYPE_LABELS[v.venue_type]],
                  ["Setting", v.setting ? SETTING_LABELS[v.setting] : null],
                  ["Who can play", ACCESS_LABELS[v.access_type]],
                  ["Accommodation", yesNo(v.accommodation_available)],
                  ["Address", v.address],
                ] as [string, string | null][]).map(([k, val]) => (
                  <div key={k} className="grid grid-cols-[130px_1fr] gap-4 py-3">
                    <dt className="text-charcoal/55">{k}</dt>
                    <dd className={val ? "text-charcoal" : "text-charcoal/45 italic"}>{val ?? "Not confirmed"}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-col gap-3">
                {v.booking_url && <a className="btn-forest" href={v.booking_url} target="_blank" rel="noopener noreferrer">Book court time ↗</a>}
                {v.website && <a className="btn-ghost-dark" href={v.website} target="_blank" rel="noopener noreferrer">Official website ↗</a>}
                {v.phone && <a className="link-underline text-[14px] text-forest" href={`tel:${v.phone.replace(/\s+/g, "")}`}>{v.phone}</a>}
                {v.email && <a className="link-underline text-[14px] text-forest" href={`mailto:${v.email}`}>{v.email}</a>}
              </div>
            </section>

            {points.length > 0 && (
              <section aria-labelledby="map-h">
                <h2 id="map-h" className="eyebrow mb-4 text-forest">Location</h2>
                <MapLoader points={points} className="h-[300px]" zoom={v.coordinates_approximate ? 9 : 13} />
                {v.coordinates_approximate && <p className="mt-2 text-xs text-stone">Approximate location — pin marks the town or area, not the exact venue.</p>}
              </section>
            )}

            <section className="border-l-2 border-lime-2 pl-6" aria-labelledby="ver-h" data-testid="verification-panel">
              <h2 id="ver-h" className="eyebrow mb-3 text-forest">How we know this</h2>
              <p className="font-semibold text-forest">{verification.label}</p>
              <p className="mt-1 text-[14px] text-charcoal/70">{verification.description}</p>
              <p className="mt-3 text-[13px] text-charcoal/60"><LastVerified date={v.last_verified_at} /></p>
              {v.verification_notes && <p className="mt-3 text-[13px] leading-relaxed text-charcoal/70">{v.verification_notes}</p>}
              {sources.length > 0 && (
                <>
                  <h3 className="eyebrow mt-6 mb-3 text-[10px] text-forest/60">Sources</h3>
                  <ol className="space-y-3 text-[13px]">
                    {sources.map((s) => (
                      <li key={s.id}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-forest underline decoration-forest/30 underline-offset-2 hover:decoration-forest">{s.title ?? new URL(s.url).hostname}</a>
                        {s.fact && <span className="block text-charcoal/65">{s.fact}</span>}
                        {s.accessed_at && <span className="block text-[11px] text-charcoal/45">Consulted {formatDate(s.accessed_at)}</span>}
                      </li>
                    ))}
                  </ol>
                </>
              )}
              <p className="mt-6 text-[13px] text-charcoal/70">Spotted something out of date? <Link className="underline" href={`/contact?topic=Venue%20update&venue=${encodeURIComponent(v.name)}`}>Tell us</Link>.</p>
            </section>
          </div>
        </aside>
      </div>

      {videos.length > 0 && (
        <section className="bg-charcoal py-16 text-ivory">
          <div className="container-x">
            <h2 className="eyebrow mb-6 text-lime">Films from {v.name}</h2>
            <ul className="space-y-2">{videos.map((vid) => <li key={vid.id}><Link className="display text-[32px] hover:text-lime" href={`/films#${vid.slug}`}>{vid.title}</Link></li>)}</ul>
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="border-t border-forest/10 bg-white py-20">
          <div className="container-x">
            <h2 className="eyebrow mb-10 text-forest">Read more</h2>
            <div className="grid gap-10 md:grid-cols-3">{articles.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
          </div>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="container-x py-20">
          <h2 className="display mb-10 text-[44px] text-forest">More courts in {d?.name}</h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{nearby.map((n) => <VenueCard key={n.venue.id} item={n} />)}</div>
        </section>
      )}
    </article>
  );
}

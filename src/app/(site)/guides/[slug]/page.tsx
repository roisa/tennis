import Link from "next/link";
import { Suspense } from "react";
import { CheckoutCancelledNotice } from "@/components/checkout-form";
import { notFound } from "next/navigation";
import { GuideCover, VenueCard } from "@/components/cards";
import { CheckoutForm } from "@/components/checkout-form";
import { JsonLd } from "@/components/json-ld";
import { Media } from "@/components/media";
import { Breadcrumbs } from "@/components/ui";
import { formatPrice } from "@/lib/labels";
import { getPaymentMode } from "@/lib/payments";
import { getGuideBySlug, getGuides, publicGuide } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  return (await getGuides()).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getGuideBySlug((await params).slug);
  if (!data) return {};
  return pageMetadata({ title: `${data.guide.title} — Digital Tennis Travel Guide`, description: data.guide.subtitle ?? data.guide.description ?? undefined, path: `/guides/${data.guide.slug}`, image: data.guide.cover_image });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getGuideBySlug((await params).slug);
  if (!data) notFound();
  const g = publicGuide(data.guide);
  const price = formatPrice(g.price, g.currency);
  const pay = getPaymentMode();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Product", name: g.title, description: g.description ?? undefined, brand: { "@type": "Brand", name: "COURTSCAPE" }, url: absoluteUrl(`/guides/${g.slug}`),
        ...(g.available ? { offers: { "@type": "Offer", price: g.price.toFixed(2), priceCurrency: g.currency, availability: "https://schema.org/PreOrder", url: absoluteUrl(`/guides/${g.slug}`) } } : {}) }} />
      <section className="bg-ivory-2">
        <div className="container-x grid gap-14 py-14 md:py-20 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: g.title, path: `/guides/${g.slug}` }]} />
            <h1 className="display mt-8 text-[56px] text-forest sm:text-[80px]">{g.title}</h1>
            {g.subtitle && <p className="mt-4 text-xl text-charcoal/75">{g.subtitle}</p>}
            {g.status_note && <p className="mt-6 inline-block bg-white px-4 py-2 text-[13px] text-forest ring-1 ring-forest/15"><strong className="eyebrow mr-2 text-[10px]">Note</strong>{g.status_note}</p>}
            <div className="mt-10 max-w-md bg-white p-7 ring-1 ring-forest/10" id="buy">
              <div className="mb-6 flex items-baseline justify-between">
                <span className="display text-[48px] text-forest">{price}</span>
                <span className="eyebrow text-[10px] text-forest/60">{g.format} · Instant download</span>
              </div>
              <Suspense><CheckoutCancelledNotice /></Suspense>
              {pay.mode === "test" && <p className="eyebrow mb-4 bg-lime px-3 py-2 text-center text-[10px] text-forest">Test mode — no real payments</p>}
              {g.available && pay.provider ? (
                <CheckoutForm slug={g.slug} priceLabel={price} testMode={pay.mode === "test"} title={g.title} />
              ) : (
                <div>
                  <p className="text-charcoal/75">{g.available ? pay.reason : "This guide is coming soon. Join the Dispatch to hear when it launches."}</p>
                  <Link href={g.available ? "/contact?topic=Guides" : "/#nl-title"} className="btn-ghost-dark mt-5 w-full">{g.available ? "Ask about this guide" : "Notify me"}</Link>
                </div>
              )}
            </div>
          </div>
          <div className="relative lg:col-span-5 lg:col-start-8">
            <GuideCover guide={data.guide} className="mx-auto max-w-[380px] -rotate-2" />
          </div>
        </div>
      </section>

      <section className="container-x grid gap-16 py-20 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h2 className="eyebrow mb-5 text-forest">About this guide</h2>
          <p className="text-[19px] leading-relaxed text-charcoal/85">{g.description}</p>
          {g.includes.length > 0 && (
            <>
              <h2 className="eyebrow mt-14 mb-5 text-forest">What&rsquo;s included</h2>
              <ul className="space-y-3">{g.includes.map((i) => <li key={i} className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-lime-2" />{i}</li>)}</ul>
            </>
          )}
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <h2 className="eyebrow mb-5 text-forest">Contents</h2>
          <ol className="divide-y divide-forest/15 border-y border-forest/15">
            {g.contents.map((c, i) => <li key={c} className="flex gap-5 py-4"><span className="display text-[22px] text-forest/40">{String(i + 1).padStart(2, "0")}</span><span className="pt-1">{c}</span></li>)}
          </ol>
        </div>
      </section>

      <section className="bg-forest py-20 text-ivory" aria-labelledby="preview-h">
        <div className="container-x">
          <h2 id="preview-h" className="eyebrow mb-3 text-lime">Preview pages</h2>
          <p className="mb-10 max-w-xl text-ivory/70">Layout previews. Final page designs will be added once the guide&rsquo;s photography is complete.</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {["Destination opener", "Court profile", "Itinerary spread"].map((label, i) => (
              <figure key={label}>
                <div className="relative aspect-[3/4] overflow-hidden bg-ivory p-5">
                  <div className="relative h-[55%]"><Media alt={`${label} preview`} scene={i === 1 ? "cliff" : i === 2 ? "jungle" : g.scene} seed={`${g.slug}-p${i}`} zoom={false} /></div>
                  <div className="mt-4 h-3 w-3/4 bg-forest/80" /><div className="mt-2 h-2 w-full bg-forest/15" /><div className="mt-2 h-2 w-5/6 bg-forest/15" /><div className="mt-2 h-2 w-2/3 bg-forest/15" />
                </div>
                <figcaption className="eyebrow mt-3 text-[10px] text-ivory/60">{label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {data.venues.length > 0 && (
        <section className="container-x py-20">
          <h2 className="display mb-10 text-[44px] text-forest">Venues covered{data.destination ? ` in ${data.destination.name}` : ""}</h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{data.venues.map((v) => <VenueCard key={v.venue.id} item={v} />)}</div>
        </section>
      )}
    </>
  );
}

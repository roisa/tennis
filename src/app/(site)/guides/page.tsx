import { GuideCard } from "@/components/cards";
import { PageHero } from "@/components/ui";
import { getGuides, publicGuide } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const metadata = pageMetadata({ title: "Tennis Travel Guides — Digital Downloads", description: "Beautifully designed digital guides for tennis holidays: where to play, where to stay and how to book.", path: "/guides" });

export default async function GuidesPage() {
  const guides = (await getGuides()).map(publicGuide);
  return (
    <>
      <PageHero eyebrow="COURTSCAPE Guides" title="Plan the escape." intro="Digital guides built from our research and travels — designed to be read on the plane and used on the ground." />
      <section className="container-x py-20" aria-label="Guides">
        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">{guides.map((g) => <GuideCard key={g.id} guide={g} available={g.available} />)}</div>
        <div className="mt-24 grid gap-8 border-t border-forest/15 pt-12 md:grid-cols-3">
          {[["Instant download", "Your link arrives on screen right after payment, valid for 30 days."], ["Secure checkout", "Payments are processed by our payment provider; we never see your card details."], ["Made by travellers", "Every guide states how its information was verified and when."]].map(([t, b]) => (
            <div key={t}><p className="display text-[28px] text-forest">{t}</p><p className="mt-2 text-[15px] text-charcoal/70">{b}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}

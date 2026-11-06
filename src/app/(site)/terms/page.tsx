import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Terms & Conditions", description: "COURTSCAPE terms and conditions.", path: "/terms" });

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms & Conditions" />
      <section className="container-x max-w-3xl py-16">
        <div role="note" className="mb-12 border-2 border-dashed border-forest/40 bg-white p-5 text-[14px] text-forest">
          <strong className="eyebrow mr-2 text-[10px]">Placeholder — requires legal review</strong>
          This document is a structural draft only. It is not legal advice and must be reviewed by a qualified lawyer (including for Indonesian, EU/UK GDPR and consumer-law requirements) before launch.
        </div>
        <div className="prose-cs">
          <h2>About these terms</h2><p>[Parties, governing law and jurisdiction to be confirmed.]</p>
          <h2>Editorial content</h2><p>Listings are provided for inspiration and planning. Each shows how it was verified. Always confirm availability, prices and access directly with venues before travelling.</p>
          <h2>Digital guides</h2><p>[Licence (personal, non-transferable use), delivery by download link, link validity (30 days) and download limits, refund and withdrawal rights, and pricing/taxes to be confirmed.]</p>
          <h2>Intellectual property</h2><p>[To be confirmed.]</p>
          <h2>Liability</h2><p>[To be confirmed.]</p>
          <h2>Changes</h2><p>[To be confirmed.]</p>
        </div>
      </section>
    </>
  );
}

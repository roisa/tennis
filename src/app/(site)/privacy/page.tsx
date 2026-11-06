import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Privacy Policy", description: "COURTSCAPE privacy policy.", path: "/privacy" });

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <section className="container-x max-w-3xl py-16">
        <div role="note" className="mb-12 border-2 border-dashed border-forest/40 bg-white p-5 text-[14px] text-forest">
          <strong className="eyebrow mr-2 text-[10px]">Placeholder — requires legal review</strong>
          This document is a structural draft only. It is not legal advice and must be reviewed by a qualified lawyer (including for Indonesian, EU/UK GDPR and consumer-law requirements) before launch.
        </div>
        <div className="prose-cs">
          <h2>Who we are</h2><p>[Legal entity name, registered address and contact details to be confirmed.]</p>
          <h2>What we collect</h2><ul><li>Newsletter: your email address and the page where you subscribed.</li><li>Contact form: your name, email and message.</li><li>Guide purchases: your email, purchase record and payment reference. Card details are handled by our payment provider and never stored by COURTSCAPE.</li><li>Analytics: if enabled, Google Analytics 4 collects usage data with IP anonymisation. [Consent mechanism to be confirmed.]</li></ul>
          <h2>Why we use it</h2><p>[Lawful bases and purposes to be confirmed.]</p>
          <h2>Processors</h2><p>[Hosting (Vercel), database and storage (Supabase), payments (provider TBC), email (provider TBC), analytics (Google).]</p>
          <h2>Retention</h2><p>[Retention periods to be confirmed.]</p>
          <h2>Your rights</h2><p>[Access, correction, deletion, objection and complaint rights to be confirmed per jurisdiction.]</p>
          <h2>Contact</h2><p>[Privacy contact to be confirmed.]</p>
        </div>
      </section>
    </>
  );
}

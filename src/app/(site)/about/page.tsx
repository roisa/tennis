import Link from "next/link";
import { Media } from "@/components/media";
import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "About COURTSCAPE", description: "COURTSCAPE discovers extraordinary places around the world where tennis meets travel. Our story, our standards and how we verify every listing.", path: "/about" });

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About" title="Beyond the court." intro="COURTSCAPE discovers extraordinary places around the world where tennis meets travel." />
      <section className="container-x grid gap-14 py-20 lg:grid-cols-12">
        <div className="relative aspect-[4/5] lg:col-span-5"><Media alt="A mountain tennis court at dawn" scene="mountain" seed="about" zoom={false} /></div>
        <div className="prose-cs lg:col-span-6 lg:col-start-7">
          <p className="display !text-[34px] !leading-snug text-forest">We believe the best tennis trips aren&rsquo;t only about the match. They&rsquo;re about the court at the edge of a cliff, the coach who knows the wind, the long lunch after.</p>
          <p>COURTSCAPE is an independent tennis travel publication and destination guide. We seek out beautiful courts — at resorts, hotels, clubs and hidden corners — and tell you honestly what it&rsquo;s like to play, stay and explore there.</p>
          <p>Our first editorial focus is Indonesia, beginning with Bali and Lombok. From there we travel outward: the lagoons of the Maldives, the summer clay of the Swiss Alps, the highland and island courts of Japan, and beyond.</p>
          <h2>Our standards</h2>
          <ul>
            <li><strong>We label how we know.</strong> Every listing shows whether it was personally reviewed, verified with the venue, sourced from public information, community submitted, or not yet verified — with dates.</li>
            <li><strong>We never invent facts.</strong> If we don&rsquo;t know a court&rsquo;s surface, price or access rules, we say so.</li>
            <li><strong>Scores are earned.</strong> The <Link href="/journal/tennis-escape-score-how-we-rate">Tennis Escape Score</Link> is only published after we&rsquo;ve played there.</li>
            <li><strong>Independence.</strong> Partnerships will always be disclosed and never buy a score.</li>
          </ul>
          <h2>Work with us</h2>
          <p>We partner with resorts, clubs and tourism boards who share our love of the game and the place. <Link href="/contact?topic=Partnerships">Get in touch</Link>.</p>
        </div>
      </section>
    </>
  );
}

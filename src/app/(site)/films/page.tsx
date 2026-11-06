import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { LiteYouTube } from "@/components/lite-youtube";
import { Media } from "@/components/media";
import { PageHero } from "@/components/ui";
import { formatDate } from "@/lib/labels";
import { getVideos } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const metadata = pageMetadata({ title: "COURTSCAPE Films — Tennis Travel Videos", description: "Short films from the world's most beautiful tennis courts and destinations.", path: "/films" });

export default async function FilmsPage() {
  const films = await getVideos();
  const categories = [...new Set(films.map((f) => f.video.category))];
  return (
    <div className="bg-charcoal text-ivory">
      <PageHero eyebrow="COURTSCAPE Films" title="Watch the places." intro="Short films from the courts and destinations we visit. Our first films are in production — subscribe to the Dispatch to see them first." />
      <div className="container-x space-y-28 py-20">
        {categories.length > 1 && <p className="eyebrow text-ivory/50">{categories.join(" · ")}</p>}
        {films.map(({ video: v, venue, article }, i) => (
          <section key={v.id} id={v.slug} className="grid scroll-mt-24 gap-10 lg:grid-cols-12 lg:items-center" aria-labelledby={`f-${v.slug}`}>
            {v.youtube_video_id && v.published_at && <JsonLd data={{ "@context": "https://schema.org", "@type": "VideoObject", name: v.title, description: v.description ?? v.title, thumbnailUrl: [v.thumbnail ?? `https://i.ytimg.com/vi/${v.youtube_video_id}/hqdefault.jpg`], uploadDate: v.published_at, embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtube_video_id}` }} />}
            <div className={`relative aspect-video overflow-hidden bg-forest lg:col-span-8 ${i % 2 ? "lg:order-2" : ""}`}>
              {v.youtube_video_id ? (
                <LiteYouTube id={v.youtube_video_id} title={v.title} />
              ) : (
                <>
                  <Media alt={v.title} scene={v.scene} seed={`video-${v.slug}`} zoom={false} />
                  <div className="absolute inset-0 flex items-center justify-center bg-forest/30"><span className="eyebrow bg-lime px-4 py-2 text-forest">In production</span></div>
                </>
              )}
            </div>
            <div className="lg:col-span-4">
              <p className="eyebrow text-lime">{v.category}{v.duration && ` · ${v.duration}`}</p>
              <h2 id={`f-${v.slug}`} className="display mt-4 text-[44px]">{v.title}</h2>
              {v.description && <p className="mt-4 text-ivory/70">{v.description}</p>}
              {v.published_at && <p className="mt-4 text-sm text-ivory/50">{formatDate(v.published_at)}</p>}
              <div className="mt-6 flex flex-col gap-2 text-[14px]">
                {venue && <Link className="link-underline w-fit text-lime" href={`/courts/${venue.venue.slug}`}>Venue: {venue.venue.name} →</Link>}
                {article && <Link className="link-underline w-fit text-lime" href={`/journal/${article.slug}`}>Read: {article.title} →</Link>}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

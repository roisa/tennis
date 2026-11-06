import Link from "next/link";
import type { Article, Destination, Guide, Video } from "@/lib/data/schema";
import { ACCESS_LABELS, SETTING_LABELS, SURFACE_LABELS, VENUE_TYPE_LABELS, formatDate, formatPrice } from "@/lib/labels";
import type { VenueListItem } from "@/lib/venue-filters";
import { Media } from "./media";
import { ScoreBadge, VerificationBadge } from "./ui";

export function DestinationCard({ destination: d, venueCount, size = "md", index, frame }: { destination: Destination; venueCount?: number; size?: "md" | "lg"; index?: number; frame?: string }) {
  return (
    <Link href={`/destinations/${d.slug}`} className="group relative block overflow-hidden bg-forest text-ivory">
      <div className={`relative ${frame ?? "aspect-[4/5]"}`}>
        <Media src={d.cover_image} alt={d.cover_alt ?? `Tennis in ${d.name}`} scene={d.scene} seed={d.slug} sizes="(min-width: 1024px) 33vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <p className="eyebrow mb-3 text-lime">{index != null && <span className="mr-3 text-ivory/50">{String(index + 1).padStart(2, "0")}</span>}{d.country}</p>
          <h3 className={`display ${size === "lg" ? "text-[56px] md:text-[72px]" : "text-[44px] md:text-[52px]"}`}>{d.name}</h3>
          {d.tagline && <p className="mt-3 max-w-sm text-[15px] text-ivory/75">{d.tagline}</p>}
          {venueCount != null && (
            <p className="eyebrow mt-5 text-[10px] text-ivory/60">
              {venueCount ? `${venueCount} ${venueCount === 1 ? "venue" : "venues"} listed` : "Research in progress"} <span aria-hidden className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function VenueCard({ item, priority }: { item: VenueListItem; priority?: boolean }) {
  const { venue: v, destination: d, surfaces, score } = item;
  const surfaceText = surfaces.length ? surfaces.map((s) => SURFACE_LABELS[s]).join(" · ") : "Surface to be confirmed";
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Media src={v.cover_image} alt={v.cover_alt ?? `${v.name} tennis court`} scene={v.scene} seed={v.slug} surface={surfaces[0]} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" priority={priority} />
        <div className="absolute top-4 left-4"><VerificationBadge status={v.verification_status} short /></div>
      </div>
      <div className="flex flex-1 flex-col border-b border-forest/15 pt-5 pb-6">
        <p className="eyebrow text-[10px] text-forest/60">
          {[v.city, d?.name, d?.country !== d?.name ? d?.country : null].filter(Boolean).join(", ")}
        </p>
        <h3 className="display mt-2 text-[30px] text-forest">
          <Link href={`/courts/${v.slug}`} className="after:absolute after:inset-0">{v.name}</Link>
        </h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          <div><dt className="sr-only">Surface</dt><dd>{surfaceText}</dd></div>
          <div><dt className="sr-only">Setting</dt><dd>{v.setting ? SETTING_LABELS[v.setting] : VENUE_TYPE_LABELS[v.venue_type]}</dd></div>
          <div><dt className="sr-only">Venue type</dt><dd className="text-charcoal/60">{VENUE_TYPE_LABELS[v.venue_type]}</dd></div>
          <div><dt className="sr-only">Access</dt><dd className="text-charcoal/60">{ACCESS_LABELS[v.access_type]}</dd></div>
        </dl>
        <div className="mt-auto pt-5"><ScoreBadge score={score} /></div>
      </div>
    </article>
  );
}

export function ArticleCard({ article: a, layout = "stack" }: { article: Article; layout?: "stack" | "feature" | "row" }) {
  const date = formatDate(a.published_at);
  if (layout === "feature") {
    return (
      <article className="group relative grid gap-8 md:grid-cols-12 md:items-end">
        <div className="relative aspect-[16/11] overflow-hidden md:col-span-8">
          <Media src={a.cover_image} alt={a.cover_alt ?? a.title} scene={a.scene} seed={a.slug} sizes="(min-width: 768px) 66vw, 100vw" />
        </div>
        <div className="md:col-span-4 md:pb-4">
          <p className="eyebrow text-forest/60">{a.category}{date && <span className="text-forest/40"> · {date}</span>}</p>
          <h3 className="display mt-4 text-[40px] text-forest md:text-[52px]"><Link href={`/journal/${a.slug}`} className="after:absolute after:inset-0">{a.title}</Link></h3>
          {a.excerpt && <p className="mt-4 text-[16px] leading-relaxed text-charcoal/75">{a.excerpt}</p>}
          <p className="eyebrow mt-6 text-forest">Read the story <span aria-hidden>→</span></p>
        </div>
      </article>
    );
  }
  if (layout === "row") {
    return (
      <article className="group relative grid grid-cols-[112px_1fr] gap-5 border-t border-forest/15 py-6 sm:grid-cols-[160px_1fr]">
        <div className="relative aspect-square overflow-hidden"><Media src={a.cover_image} alt={a.cover_alt ?? a.title} scene={a.scene} seed={a.slug} sizes="160px" /></div>
        <div>
          <p className="eyebrow text-[10px] text-forest/60">{a.category}</p>
          <h3 className="display mt-2 text-[26px] leading-tight text-forest"><Link href={`/journal/${a.slug}`} className="after:absolute after:inset-0">{a.title}</Link></h3>
          {date && <p className="mt-2 text-xs text-charcoal/50">{date}</p>}
        </div>
      </article>
    );
  }
  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden"><Media src={a.cover_image} alt={a.cover_alt ?? a.title} scene={a.scene} seed={a.slug} sizes="(min-width: 768px) 33vw, 100vw" /></div>
      <p className="eyebrow mt-5 text-[10px] text-forest/60">{a.category}{date && <span className="text-forest/40"> · {date}</span>}</p>
      <h3 className="display mt-2 text-[30px] leading-tight text-forest"><Link href={`/journal/${a.slug}`} className="after:absolute after:inset-0">{a.title}</Link></h3>
      {a.excerpt && <p className="mt-3 line-clamp-3 text-[15px] text-charcoal/70">{a.excerpt}</p>}
    </article>
  );
}

export function GuideCover({ guide: g, className = "" }: { guide: Pick<Guide, "title" | "subtitle" | "scene" | "slug" | "cover_image">; className?: string }) {
  return (
    <div className={`relative aspect-[3/4] overflow-hidden bg-forest shadow-[0_30px_60px_-30px_rgba(21,45,40,0.6)] ${className}`}>
      <Media src={g.cover_image} alt={`${g.title} cover`} scene={g.scene} seed={`guide-${g.slug}`} zoom={false} />
      <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-forest/90 via-transparent to-forest/90 p-6 text-ivory">
        <p className="eyebrow text-[9px] tracking-[0.3em] text-lime">COURTSCAPE Guides</p>
        <div>
          <p className="display text-[34px] leading-[0.95]">{g.title}</p>
          {g.subtitle && <p className="mt-2 text-[11px] text-ivory/75">{g.subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export function GuideCard({ guide: g, available }: { guide: Pick<Guide, "title" | "subtitle" | "scene" | "slug" | "cover_image" | "price" | "currency" | "status_note">; available: boolean }) {
  return (
    <article className="group relative">
      <div className="bg-ivory-2 p-8 sm:p-10"><GuideCover guide={g} className="mx-auto max-w-[260px] transition-transform duration-700 group-hover:-translate-y-1.5" /></div>
      <div className="flex items-start justify-between gap-4 pt-5">
        <div>
          <h3 className="display text-[28px] text-forest"><Link href={`/guides/${g.slug}`} className="after:absolute after:inset-0">{g.title}</Link></h3>
          <p className="mt-1 text-[14px] text-charcoal/70">{g.subtitle}</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="display block text-[28px] text-forest">{formatPrice(g.price, g.currency)}</span>
          <span className="eyebrow text-[10px] text-charcoal/60">{available ? "Digital PDF" : "Coming soon"}</span>
        </p>
      </div>
    </article>
  );
}

export function VideoCard({ video: v }: { video: Video }) {
  return (
    <article className="group relative">
      <div className="relative aspect-video overflow-hidden bg-forest">
        <Media src={v.thumbnail ?? (v.youtube_video_id ? `https://i.ytimg.com/vi/${v.youtube_video_id}/hqdefault.jpg` : null)} alt={v.title} scene={v.scene} seed={`video-${v.slug}`} sizes="(min-width: 768px) 33vw, 100vw" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-ivory/60 bg-forest/40 text-ivory backdrop-blur-sm transition-colors group-hover:border-lime group-hover:text-lime">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
          </span>
        </div>
        {!v.youtube_video_id && <span className="eyebrow absolute top-4 left-4 bg-lime px-2.5 py-1.5 text-[10px] text-forest">In production</span>}
      </div>
      <p className="eyebrow mt-5 text-[10px] text-lime">{v.category}</p>
      <h3 className="display mt-2 text-[28px] leading-tight text-ivory"><Link href={`/films#${v.slug}`} className="after:absolute after:inset-0">{v.title}</Link></h3>
    </article>
  );
}

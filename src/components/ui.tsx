import Link from "next/link";
import type { VerificationStatus } from "@/lib/data/schema";
import { VERIFICATION_LABELS, formatDate } from "@/lib/labels";
import { breadcrumbLd } from "@/lib/seo";
import { JsonLd } from "./json-ld";

export function SectionHeading({ eyebrow, title, intro, href, cta, tone = "dark", id }: { eyebrow?: string; title: string; intro?: string; href?: string; cta?: string; tone?: "dark" | "light"; id?: string }) {
  const light = tone === "light";
  return (
    <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className={`eyebrow mb-4 ${light ? "text-lime" : "text-forest/60"}`}>{eyebrow}</p>}
        <h2 id={id} className={`display text-[44px] sm:text-[60px] lg:text-[76px] ${light ? "text-ivory" : "text-forest"}`}>{title}</h2>
        {intro && <p className={`mt-5 max-w-xl text-[17px] leading-relaxed ${light ? "text-ivory/70" : "text-charcoal/70"}`}>{intro}</p>}
      </div>
      {href && (
        <Link href={href} className={`eyebrow group inline-flex shrink-0 items-center gap-3 ${light ? "text-lime" : "text-forest"}`}>
          <span className="link-underline">{cta ?? "View all"}</span>
          <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}

const TONES: Record<VerificationStatus, string> = {
  personally_reviewed: "bg-lime text-forest",
  venue_verified: "bg-forest text-lime",
  public_sources: "bg-ivory text-forest ring-1 ring-forest/25",
  community_submitted: "bg-white text-charcoal ring-1 ring-charcoal/20",
  unverified: "bg-white/90 text-charcoal ring-1 ring-charcoal/20",
};

export function VerificationBadge({ status, short }: { status: VerificationStatus; short?: boolean }) {
  const meta = VERIFICATION_LABELS[status];
  return (
    <span title={meta.description} className={`eyebrow inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] ${TONES[status]}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status === "personally_reviewed" ? "bg-forest" : status === "venue_verified" ? "bg-lime" : "bg-current opacity-50"}`} />
      {short ? meta.short : meta.label}
    </span>
  );
}

export function ScoreBadge({ score, size = "sm" }: { score: number | null; size?: "sm" | "lg" }) {
  if (score == null) {
    return <span className={`eyebrow text-[10px] ${size === "lg" ? "text-ivory/80" : "text-charcoal/60"}`}>Not yet reviewed</span>;
  }
  return (
    <span className="inline-flex items-baseline gap-1.5" aria-label={`Tennis Escape Score ${score.toFixed(1)} out of 10`}>
      <span className={`display ${size === "lg" ? "text-[64px] text-lime" : "text-[28px] text-forest"}`}>{score.toFixed(1)}</span>
      <span className={`eyebrow text-[10px] ${size === "lg" ? "text-ivory/60" : "text-charcoal/60"}`}>/10 Escape Score</span>
    </span>
  );
}

export function Breadcrumbs({ items, tone = "dark" }: { items: { name: string; path: string }[]; tone?: "dark" | "light" }) {
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className={`eyebrow flex flex-wrap items-center gap-2 text-[10px] ${tone === "light" ? "text-ivory/70" : "text-forest/60"}`}>
          {items.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              {i < items.length - 1 ? <Link className="link-underline hover:opacity-100" href={it.path}>{it.name}</Link> : <span aria-current="page" className={tone === "light" ? "text-ivory" : "text-forest"}>{it.name}</span>}
              {i < items.length - 1 && <span aria-hidden>/</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(items)} />
    </>
  );
}

export function LastVerified({ date }: { date: string | null }) {
  const d = formatDate(date);
  return <span>{d ? `Last verified ${d}` : "Not yet verified with venue"}</span>;
}

export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="bg-forest text-ivory">
      <div className="container-x pt-16 pb-14 md:pt-24 md:pb-20">
        <p className="eyebrow rise mb-6 text-lime">{eyebrow}</p>
        <h1 className="display rise-2 max-w-5xl text-[56px] sm:text-[84px] lg:text-[112px]">{title}</h1>
        {intro && <p className="rise-3 mt-6 max-w-2xl text-lg leading-relaxed text-ivory/75">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-forest/25 px-6 py-16 text-center">
      <p className="display text-[36px] text-forest">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-charcoal/70">{body}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

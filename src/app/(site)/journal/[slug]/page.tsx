import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard, VenueCard } from "@/components/cards";
import { JsonLd } from "@/components/json-ld";
import { Media } from "@/components/media";
import { Breadcrumbs } from "@/components/ui";
import { formatDate } from "@/lib/labels";
import { Markdown, headings, readingMinutes } from "@/lib/markdown";
import { getArticleBySlug, getArticles } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getArticleBySlug((await params).slug);
  if (!data) return {};
  const a = data.article;
  return pageMetadata({ title: a.seo_title ?? a.title, description: a.seo_description ?? a.excerpt ?? undefined, path: `/journal/${a.slug}`, image: a.cover_image, type: "article", publishedTime: a.published_at });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getArticleBySlug((await params).slug);
  if (!data) notFound();
  const { article: a, destination, venue, related } = data;
  const toc = headings(a.body);
  return (
    <article>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.excerpt ?? undefined,
        datePublished: a.published_at ?? undefined, dateModified: a.updated_at, author: { "@type": "Organization", name: a.author },
        publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
        mainEntityOfPage: absoluteUrl(`/journal/${a.slug}`), ...(a.cover_image ? { image: [a.cover_image] } : {}), keywords: a.tags.join(", "),
      }} />
      <header className="bg-forest text-ivory">
        <div className="container-x pt-12 pb-14 md:pt-20">
          <Breadcrumbs tone="light" items={[{ name: "Home", path: "/" }, { name: "Journal", path: "/journal" }, { name: a.title, path: `/journal/${a.slug}` }]} />
          <p className="eyebrow mt-10 text-lime"><Link href={`/journal?category=${encodeURIComponent(a.category)}`}>{a.category}</Link></p>
          <h1 className="display mt-5 max-w-5xl text-[52px] sm:text-[76px] lg:text-[96px]">{a.title}</h1>
          {a.excerpt && <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ivory/75">{a.excerpt}</p>}
          <p className="eyebrow mt-10 text-[10px] text-ivory/50">By {a.author} · {formatDate(a.published_at, { day: "numeric", month: "long", year: "numeric" })} · {readingMinutes(a.body)} min read</p>
        </div>
        <div className="container-x">
          <div className="relative aspect-[16/8] translate-y-16 overflow-hidden md:translate-y-24">
            <Media src={a.cover_image} alt={a.cover_alt ?? a.title} scene={a.scene} seed={a.slug} priority zoom={false} />
          </div>
        </div>
      </header>
      <div className="container-x grid gap-12 pt-32 pb-20 md:pt-40 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          {toc.length > 1 && (
            <nav aria-label="In this story" className="sticky top-24">
              <p className="eyebrow mb-4 text-[10px] text-forest/50">In this story</p>
              <ol className="space-y-3 border-l border-forest/15 pl-4 text-[14px]">
                {toc.map((h) => <li key={h.id}><a className="text-charcoal/70 hover:text-forest" href={`#${h.id}`}>{h.text}</a></li>)}
              </ol>
            </nav>
          )}
        </aside>
        <div className="prose-cs max-w-[68ch] lg:col-span-7">
          <Markdown source={a.body} />
          {a.tags.length > 0 && <p className="eyebrow mt-12 text-[10px] text-forest/50">Tagged: {a.tags.join(" · ")}</p>}
        </div>
      </div>
      {(venue || destination) && (
        <section className="container-x pb-20">
          <div className="grid gap-10 border-t border-forest/15 pt-12 md:grid-cols-12">
            <h2 className="display text-[40px] text-forest md:col-span-4">Featured in this story</h2>
            <div className="md:col-span-8">
              {venue ? <div className="max-w-sm"><VenueCard item={venue} /></div> : destination && <Link href={`/destinations/${destination.slug}`} className="btn-forest">Explore {destination.name} →</Link>}
            </div>
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="bg-white py-20">
          <div className="container-x">
            <h2 className="eyebrow mb-10 text-forest">Keep reading</h2>
            <div className="grid gap-10 md:grid-cols-3">{related.map((r) => <ArticleCard key={r.id} article={r} />)}</div>
          </div>
        </section>
      )}
    </article>
  );
}

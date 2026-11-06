import Link from "next/link";
import { ArticleCard } from "@/components/cards";
import { EmptyState, PageHero } from "@/components/ui";
import { ARTICLE_CATEGORIES } from "@/lib/data/schema";
import { getArticles } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "The Journal — Tennis Travel Stories & Guides",
  description: "Stories, planning guides and field notes on tennis travel: beautiful courts, tennis resorts and destinations around the world.",
  path: "/journal",
});

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const cat = ARTICLE_CATEGORIES.find((c) => c === category);
  const articles = await getArticles(cat);
  const [lead, ...rest] = articles;
  return (
    <>
      <PageHero eyebrow="The Journal" title={cat ?? "Stories from the baseline."} intro="Field notes, destination stories and practical planning for travelling tennis players." />
      <nav aria-label="Journal categories" className="border-b border-forest/10 bg-ivory">
        <ul className="container-x flex gap-6 overflow-x-auto py-5">
          <li><Link href="/journal" aria-current={!cat ? "page" : undefined} className={`eyebrow whitespace-nowrap ${!cat ? "text-forest underline decoration-lime-2 decoration-2 underline-offset-8" : "text-forest/50 hover:text-forest"}`}>All stories</Link></li>
          {ARTICLE_CATEGORIES.map((c) => (
            <li key={c}><Link href={`/journal?category=${encodeURIComponent(c)}`} aria-current={cat === c ? "page" : undefined} className={`eyebrow whitespace-nowrap ${cat === c ? "text-forest underline decoration-lime-2 decoration-2 underline-offset-8" : "text-forest/50 hover:text-forest"}`}>{c}</Link></li>
          ))}
        </ul>
      </nav>
      <div className="container-x py-16 md:py-24">
        {!lead ? (
          <EmptyState title="No stories here yet." body="New stories are on their way." action={<Link href="/journal" className="btn-forest">All stories</Link>} />
        ) : (
          <>
            <ArticleCard article={lead} layout="feature" />
            <div className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">{rest.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
          </>
        )}
      </div>
    </>
  );
}

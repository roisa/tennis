import { Suspense } from "react";
import { JournalStatic } from "@/components/journal-static";
import { JournalView } from "@/components/journal-view";
import { ARTICLE_CATEGORIES } from "@/lib/data/schema";
import { getArticles } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { IS_STATIC } from "@/lib/static-mode";

export const metadata = pageMetadata({
  title: "The Journal — Tennis Travel Stories & Guides",
  description: "Stories, planning guides and field notes on tennis travel: beautiful courts, tennis resorts and destinations around the world.",
  path: "/journal",
});

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  if (IS_STATIC) {
    const all = await getArticles();
    return <Suspense fallback={<JournalView articles={all} />}><JournalStatic articles={all} /></Suspense>;
  }
  const { category } = await searchParams;
  const cat = ARTICLE_CATEGORIES.find((c) => c === category);
  return <JournalView articles={await getArticles(cat)} cat={cat} />;
}

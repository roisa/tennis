"use client";

import { useSearchParams } from "next/navigation";
import { ARTICLE_CATEGORIES, type Article } from "@/lib/data/schema";
import { JournalView } from "./journal-view";

export function JournalStatic({ articles }: { articles: Article[] }) {
  const category = useSearchParams().get("category");
  const cat = ARTICLE_CATEGORIES.find((c) => c === category);
  return <JournalView articles={cat ? articles.filter((a) => a.category === cat) : articles} cat={cat} />;
}

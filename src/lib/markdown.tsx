import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Minimal, safe Markdown subset for journal articles → React elements (no raw HTML).
 * Supports: ## / ### headings, paragraphs, - lists, > quotes, **bold**, *italic*, [links](url).
 */
const SAFE_URL = /^(https?:\/\/|\/|#|mailto:)/i;

export function inline(text: string, keyPrefix = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${n++}`;
    if (m[1] != null) out.push(<strong key={key}>{inline(m[1], key)}</strong>);
    else if (m[2] != null) out.push(<em key={key}>{inline(m[2], key)}</em>);
    else {
      const href = m[4];
      const label = inline(m[3], key);
      if (!SAFE_URL.test(href)) out.push(<Fragment key={key}>{label}</Fragment>);
      else if (href.startsWith("/")) out.push(<Link key={key} href={href}>{label}</Link>);
      else out.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer">{label}</a>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <>
      {blocks.map((raw, i) => {
        const b = raw.trim();
        if (!b) return null;
        if (b.startsWith("### ")) return <h3 key={i}>{inline(b.slice(4), `h${i}`)}</h3>;
        if (b.startsWith("## ")) {
          const text = b.slice(3);
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          return <h2 key={i} id={id}>{inline(text, `h${i}`)}</h2>;
        }
        if (b.startsWith("> ")) return <blockquote key={i}>{inline(b.split("\n").map((l) => l.replace(/^>\s?/, "")).join(" "), `q${i}`)}</blockquote>;
        if (/^- /m.test(b) && b.split("\n").every((l) => l.startsWith("- "))) {
          return <ul key={i}>{b.split("\n").map((l, j) => <li key={j}>{inline(l.slice(2), `l${i}-${j}`)}</li>)}</ul>;
        }
        return <p key={i}>{inline(b.replace(/\n/g, " "), `p${i}`)}</p>;
      })}
    </>
  );
}

export function readingMinutes(body: string) {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));
}

export function headings(body: string) {
  return [...body.matchAll(/^## (.+)$/gm)].map((m) => ({ text: m[1].replace(/\*|\[|\]\([^)]*\)/g, ""), id: m[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }));
}

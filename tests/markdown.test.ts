import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "@/lib/markdown";

describe("journal markdown", () => {
  const html = (s: string) => renderToStaticMarkup(Markdown({ source: s }));
  it("renders headings, lists, emphasis and quotes", () => {
    const out = html("## Hello\n\n- **one**\n- *two*\n\n> quote");
    expect(out).toContain('<h2 id="hello">Hello</h2>');
    expect(out).toContain("<strong>one</strong>");
    expect(out).toContain("<em>two</em>");
    expect(out).toContain("<blockquote>quote</blockquote>");
  });
  it("escapes raw HTML and drops unsafe link schemes", () => {
    const out = html('<script>alert(1)</script> [x](javascript:alert(1)) [ok](https://example.com)');
    expect(out).not.toContain("<script>");
    expect(out).not.toContain("javascript:");
    expect(out).toContain('href="https://example.com"');
  });
});

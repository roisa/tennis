import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x py-32">
      <p className="eyebrow text-forest/60">404 — Out</p>
      <h1 className="display mt-4 text-[72px] text-forest sm:text-[120px]">Long ball.</h1>
      <p className="mt-4 max-w-md text-lg text-charcoal/70">We couldn&rsquo;t find that page. It may have moved, or the court may not be listed yet.</p>
      <div className="mt-10 flex flex-wrap gap-3"><Link href="/" className="btn-forest">Back to home</Link><Link href="/courts" className="btn-ghost-dark">Search courts</Link></div>
    </section>
  );
}

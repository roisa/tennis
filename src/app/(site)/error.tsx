"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <section className="container-x py-32">
      <p className="eyebrow text-forest/60">Let</p>
      <h1 className="display mt-4 text-[72px] text-forest">Something went wrong.</h1>
      <p className="mt-4 max-w-md text-lg text-charcoal/70">Please try again. If it keeps happening, let us know.</p>
      <div className="mt-10 flex gap-3"><button onClick={reset} className="btn-forest">Try again</button><Link href="/" className="btn-ghost-dark">Home</Link></div>
    </section>
  );
}

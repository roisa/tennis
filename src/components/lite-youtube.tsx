"use client";

import { useState } from "react";

/**
 * Click-to-load YouTube facade: no third-party requests until the visitor presses play.
 * Uses the privacy-enhanced youtube-nocookie.com domain.
 */
export function LiteYouTube({ id, title, poster }: { id: string; title: string; poster?: React.ReactNode }) {
  const [active, setActive] = useState(false);
  if (active) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }
  return (
    <button type="button" onClick={() => setActive(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play film: ${title}`}>
      {poster ?? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lime text-forest transition-transform group-hover:scale-105">
          <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
        </span>
      </span>
    </button>
  );
}

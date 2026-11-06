"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./venue-map";

const VenueMap = dynamic(() => import("./venue-map"), {
  ssr: false,
  loading: () => <div className="flex h-full min-h-[320px] items-center justify-center bg-ivory-2 text-sm text-stone">Loading map…</div>,
});

export function MapLoader(props: { points: MapPoint[]; className?: string; zoom?: number }) {
  return <VenueMap {...props} />;
}
export type { MapPoint };

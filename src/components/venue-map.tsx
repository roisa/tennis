"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapPoint = { slug: string; name: string; lat: number; lng: number; subtitle?: string; approximate?: boolean };

/**
 * Interactive venue map (Leaflet). Uses Mapbox raster tiles when NEXT_PUBLIC_MAPBOX_TOKEN
 * is set; falls back to OpenStreetMap tiles for development (respect OSM's tile usage policy —
 * configure Mapbox for production traffic).
 */
export default function VenueMap({ points, className = "h-[480px]", zoom }: { points: MapPoint[]; className?: string; zoom?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false, worldCopyJump: true, attributionControl: true });
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (token) {
        L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`, {
          attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);
      } else {
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);
      }
      const icon = L.divIcon({ className: "cs-pin", iconSize: [18, 18] });
      const markers = points.map((p) => {
        const m = L.marker([p.lat, p.lng], { icon, title: p.name, alt: p.name, keyboard: true }).addTo(map!);
        const el = document.createElement("div");
        const a = document.createElement("a");
        a.href = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/courts/${p.slug}${process.env.NEXT_PUBLIC_STATIC_EXPORT === "1" ? "/" : ""}`;
        a.textContent = p.name;
        a.style.cssText = "font-weight:600;color:#152D28";
        el.appendChild(a);
        if (p.subtitle) {
          const s = document.createElement("div");
          s.textContent = p.subtitle;
          s.style.cssText = "font-size:12px;color:#6b6f68;margin-top:2px";
          el.appendChild(s);
        }
        if (p.approximate) {
          const s = document.createElement("div");
          s.textContent = "Approximate location";
          s.style.cssText = "font-size:11px;color:#6b6f68;margin-top:4px;text-transform:uppercase;letter-spacing:.08em";
          el.appendChild(s);
        }
        m.bindPopup(el);
        return m;
      });
      if (points.length === 1) map.setView([points[0].lat, points[0].lng], zoom ?? 11);
      else if (points.length) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.25), { maxZoom: zoom ?? 9 });
      else map.setView([0, 100], 2);
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [points, zoom]);

  return (
    <div className={`relative z-0 overflow-hidden bg-[#dfe3da] ${className}`}>
      <div ref={ref} className="absolute inset-0" role="region" aria-label={`Map showing ${points.length} tennis venues`} data-testid="venue-map" />
    </div>
  );
}

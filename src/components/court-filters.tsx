"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { INDOOR_LABELS, SETTING_LABELS, SURFACE_LABELS } from "@/lib/labels";

type Props = { countries: string[]; destinations: [string, string][] };

const sel = "w-full appearance-none border border-forest/20 bg-white bg-[length:10px] bg-[right_14px_center] bg-no-repeat py-3 pr-9 pl-4 text-[14px] text-charcoal focus:border-forest focus:outline-none";
const chevron = { backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23152D28' fill='none' stroke-width='1.5'/%3E%3C/svg%3E\")" };

/** Progressive enhancement: a plain GET form that auto-applies on change when JS is available. */
export function CourtFilters({ countries, destinations }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const apply = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const next = new URLSearchParams();
    for (const [k, v] of fd) if (typeof v === "string" && v.trim()) next.set(k, v.trim());
    if (params.get("view")) next.set("view", params.get("view")!);
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  const v = (k: string) => params.get(k) ?? "";
  const field = (name: string, label: string, options: [string, string][], all: string) => (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">{label}</label>
      <select id={`f-${name}`} name={name} defaultValue={v(name)} className={sel} style={chevron}>
        <option value="">{all}</option>
        {options.map(([val, text]) => <option key={val} value={val}>{text}</option>)}
      </select>
    </div>
  );

  return (
    <form
      key={params.toString()}
      role="search"
      aria-label="Filter tennis courts"
      method="get"
      action={pathname}
      onChange={(e) => {
        if ((e.target as HTMLElement).tagName === "SELECT") apply(e.currentTarget);
      }}
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end"
      aria-busy={pending}
    >
      <div className="sm:col-span-2 lg:col-span-3">
        <label htmlFor="f-q" className="field-label">Search</label>
        <div className="flex">
          <input id="f-q" name="q" type="search" defaultValue={v("q")} placeholder="Venue, city or country" className="field" />
          <button type="submit" className="btn-forest px-4" aria-label="Apply search">→</button>
        </div>
      </div>
      <div className="lg:col-span-2">{field("country", "Country", countries.map((c) => [c, c]), "All countries")}</div>
      <div className="lg:col-span-2">{field("destination", "Destination", destinations, "All destinations")}</div>
      <div className="lg:col-span-1">{field("surface", "Surface", Object.entries(SURFACE_LABELS), "Any")}</div>
      <div className="lg:col-span-1">{field("environment", "In/Out", Object.entries(INDOOR_LABELS), "Any")}</div>
      <div className="lg:col-span-1">{field("setting", "Setting", Object.entries(SETTING_LABELS), "Any")}</div>
      <div className="lg:col-span-2">{field("type", "Venue", [["resort", "Resorts & hotels"], ["club", "Clubs & academies"]], "All venues")}</div>
      {v("experience") && <input type="hidden" name="experience" value={v("experience")} />}
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-12">
        <div className="flex items-center gap-3">
          <label htmlFor="f-sort" className="eyebrow text-[10px] text-forest/60">Sort</label>
          <select id="f-sort" name="sort" defaultValue={v("sort") || "featured"} className={`${sel} w-auto py-2`} style={chevron}>
            <option value="featured">Featured destinations</option>
            <option value="recent">Recently reviewed</option>
            <option value="score">Highest Tennis Escape Score</option>
          </select>
        </div>
        <noscript><button type="submit" className="btn-forest py-2">Apply filters</button></noscript>
        {pending && <span className="eyebrow text-[10px] text-forest/60" role="status">Updating…</span>}
      </div>
    </form>
  );
}

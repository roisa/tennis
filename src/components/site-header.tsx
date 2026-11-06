"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";
import { Wordmark } from "./logo";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overlay = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu when the route changes (adjusting state during render, per React guidance).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = !overlay || scrolled || open;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`${overlay ? "fixed" : "sticky"} inset-x-0 top-0 z-50 transition-colors duration-500 ${solid ? "bg-forest" : "bg-gradient-to-b from-forest/60 to-transparent"}`}>
      <div className="container-x flex h-[68px] items-center justify-between gap-6">
        <Link href="/" aria-label="COURTSCAPE home" className="shrink-0">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`eyebrow link-underline py-1 transition-colors ${isActive(item.href) ? "text-lime" : "text-ivory/85 hover:text-ivory"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden lg:block">
          <Link href="/guides/bali-tennis-escape-guide" className="eyebrow border border-lime/60 px-4 py-2.5 text-lime transition-colors hover:bg-lime hover:text-forest">
            Bali Guide
          </Link>
        </div>
        <button
          type="button"
          className="eyebrow flex items-center gap-3 text-ivory lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden className="relative block h-3 w-6">
            <span className={`absolute left-0 h-px w-6 bg-ivory transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-px w-6 bg-ivory transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>
      <div id="mobile-menu" hidden={!open} className="h-[calc(100dvh-68px)] overflow-y-auto bg-forest lg:hidden">
        <nav aria-label="Mobile" className="container-x flex flex-col pt-6 pb-12">
          {NAV.map((item, i) => (
            <Link key={item.href} href={item.href} className="display flex items-baseline justify-between border-b border-ivory/10 py-4 text-[40px] text-ivory hover:text-lime">
              {item.label}
              <span className="eyebrow text-ivory/40">0{i + 1}</span>
            </Link>
          ))}
          <Link href="/guides/bali-tennis-escape-guide" className="btn-lime mt-8">Bali Tennis Escape Guide</Link>
        </nav>
      </div>
    </header>
  );
}

# Development Log

## 2026-11-06 — v1 build

### Phase 1: Audit and foundation
- The repository was empty apart from a README stub, on Node 22 and npm 10. There were **no credentials** for Supabase, Stripe, Mapbox, GA or Cloudinary. Postgres 16 was available locally but not running, and there was no Docker.
- The network policy blocked image CDNs (Unsplash) and map tiles from the build container. npm and Google Fonts were reachable.
- I read the bundled Next.js 16 docs before writing code. Middleware is now `proxy.ts`, request APIs are async, Turbopack is the default, `next lint` is gone (I use the ESLint CLI with a flat config), and `revalidateTag` needs a second argument (I use `revalidatePath`).
- **Decision:** one zod schema with two stores: `PostgresStore` for Supabase in production and `LocalStore` (JSON) for zero-config development and demos. Both were verified with the full end-to-end suite.

### Research
- A research agent gathered facts on 7 Indonesian and 6 international candidates. Direct page fetches were blocked, so **every fact comes from search-result excerpts**.
- I recorded every venue as *Sourced from public information*, with no verification date, all sources listed and a public note saying so. Uncertain or conflicting facts are null. Reported prices are kept in source notes only, never as rental prices.

### Phase 2: Visual system
- I designed the brand tokens, typography (Instrument Serif with Plus Jakarta Sans), an original mark (a sun over a court in perspective) and a favicon.
- No usable photography was available, and I chose not to hotlink unverifiable stock images. Instead I built `Scene`: original SVG landscapes containing an ITF-dimension court projected in perspective, in 11 settings. Each is labelled as an illustration, and real photos replace them automatically once added.
- Fixed: Tailwind v4 can't `@apply` classes from `@layer components`, so those are now `@utility`.

### Phase 3: Directory
- Built server-side filtering from URL params, a filter form that works without JavaScript, a sticky Leaflet map (Mapbox when a token exists), and venue pages with a verification panel.
- Fixed: a group-level `loading.tsx` made `notFound()` return HTTP 200 because streaming had already started. I removed it, and real 404s are now covered by tests.

### Phases 4–6: Magazine, admin, commerce
- Built a safe Markdown subset renderer that outputs React elements only (no raw HTML, no `javascript:` links).
- The admin is driven by entity configs. Integrity rules: scores require a personal visit, and "Personally reviewed" requires a published personal review.
- Payments use a modular provider interface. In test mode, a successful purchase unlocks only the sample file. Stripe is integrated over REST with signature verification and server-side amount checks. Download tokens are stored only as hashes.
- Bugs found by tests and fixed:
  - The login rate limiter counted successful logins, so frequent editors would be locked out. Now only failures count.
  - React 19 auto-resets forms after an action, which wiped input on validation errors. All forms now submit via a transition.
  - Required-field asterisks were part of input labels. They are now `aria-hidden`, with `aria-required` set.
  - Empty non-nullable number fields now fall back to the schema defaults.
  - The mobile menu's `setState`-in-effect was replaced with the adjust-during-render pattern.

### Phases 7–8: SEO and QA
- Added the sitemap (published-only), robots, dynamic OG images, canonicals, breadcrumbs and JSON-LD. No `aggregateRating` is emitted.
- The migration was validated on local Postgres 16 with a Supabase shim. RLS was checked as anon, non-admin and admin, and the CHECK constraints and the generated score column were confirmed.
- Results: **43 unit tests** and **29 end-to-end tests** pass. The end-to-end suite passes on both the JSON store and Postgres. Lint and typecheck are clean, and the production build succeeds.

### Not verified (requires credentials)
- Live Stripe API calls. Only the signature and settlement logic were unit-tested.
- Supabase Auth sign-in and Storage signed URLs. The code paths exist but were not exercised.
- Map tiles rendering. Tiles are blocked in the build container; markers are tested.

## 2026-11-06 — GitHub Pages static preview
- Added a `STATIC_EXPORT=1` build target: `output: "export"`, base path `/tennis`, trailing slashes, unoptimised images.
- Server-only routes were renamed to `*.server.tsx|ts` and are excluded in static mode via `pageExtensions`.
- Form actions are aliased to client stubs that store and send nothing, and payments are disabled.
- Courts and journal filters run client-side (`useSearchParams`) in static mode. The full build keeps server-side filtering.
- Contact and guide pages now read query params client-side in both modes.
- `robots.ts` and `sitemap.ts` are marked `force-static` (required by export).
- Added a static share image, `public/og-default.png`.
- Verified: the static build was served under `/tennis/` and passed 26 browser checks (all pages, base-path navigation, filters, deep links, map pins, preview forms, disabled checkout, 404s, admin absent). The full-stack build still passes 43 unit and 29 end-to-end tests.

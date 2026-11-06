# COURTSCAPE — Beyond the Court.

A premium tennis-travel publication: an editorial magazine, a searchable global tennis-destination database, and a digital travel-guide marketplace.

**Discover. Play. Explore.**

---

## Contents

1. [Quick start](#quick-start)
2. [What's in v1](#whats-in-v1)
3. [Architecture](#architecture)
4. [Data model](#data-model)
5. [Verification and the Tennis Escape Score](#verification-and-the-tennis-escape-score)
6. [Payments and protected downloads](#payments-and-protected-downloads)
7. [Admin CMS](#admin-cms)
8. [Testing](#testing)
9. [Deployment (Vercel + Supabase)](#deployment-vercel--supabase) · [Static preview (GitHub Pages)](#static-preview-on-github-pages)
10. [Environment variable checklist](#environment-variable-checklist)
11. [External dependencies still required](#external-dependencies-still-required)

See also: [`DEVELOPMENT_LOG.md`](DEVELOPMENT_LOG.md) · [`TODO.md`](TODO.md) (includes the v2 roadmap).

---

## Quick start

```bash
npm install
cp .env.example .env.local      # then set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm run dev                     # http://localhost:3000
```

With no `DATABASE_URL`, the app runs on a **local JSON store** (`.data/courtscape.json`). It is seeded automatically from `src/lib/seed/` on first run. Delete the file to reset it.

The admin is at `/admin`. Sign in with any email from `ADMIN_EMAILS` plus `ADMIN_PASSWORD`. Generate a session secret with `openssl rand -base64 48`.

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` · `npm run typecheck` | ESLint (flat config) · TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright): builds and serves on port 3200 |
| `npm run db:seed-sql` | Regenerate `supabase/seed.sql` from the TypeScript seed |
| `npm run db:reset-local` | Rebuild a **local** Postgres: shim → migrations → seed (refuses non-local hosts) |
| `npm run pdfs:placeholder` | Regenerate the placeholder guide PDFs in `private/guides/` |

## What's in v1

- **Editorial site:** homepage (all 10 brief sections), Discover, Destinations, Courts, Stay & Play, Journal, Films, Guides, About, Contact, and Privacy/Terms placeholders.
- **Tennis destination database:** destinations, venues, courts, facilities, reviews, sources and photos.
- **Court directory:** server-side search and filters (country, destination, surface, indoor/outdoor, setting, resort vs club, experience), three sorts and an interactive Leaflet map. It works without JavaScript, and the filters live in the URL so results are shareable.
- **Venue pages:** practical details, honest "Not confirmed" states, a verification panel with sources and dates, the Tennis Escape Score, a map, related stories and nearby courts.
- **Magazine:** a safe Markdown renderer, table of contents, related content, and Article JSON-LD.
- **Films:** a click-to-load YouTube facade (`youtube-nocookie`), with related venue and article links.
- **Guide marketplace:** product pages, a modular payment layer (test mode plus Stripe), purchase records, and token-protected downloads.
- **Admin CMS:** CRUD for every content type, child records on venues, image upload, publish/unpublish, a verification workflow and a dashboard.
- **SEO:** Metadata API, canonical URLs, Open Graph images (`/og`), sitemap, robots, JSON-LD (Organization, WebSite, Breadcrumb, Article, Product, Resort/Hotel/SportsActivityLocation) and semantic HTML.
- **Brand system:** an original wordmark and favicon (a sun rising over a court in perspective), brand-palette tokens, Instrument Serif with Plus Jakarta Sans, and original art-directed **scene illustrations**. These are drawn in perspective to ITF court dimensions and stand in for photography until real images are added in the CMS.

## Architecture

```
src/
  app/
    (site)/            public pages (header/footer layout)
    admin/             login + (panel)/ protected CMS
    api/               download/[token], webhooks/stripe, admin/export
    og/ sitemap.ts robots.ts icon.svg
  components/          editorial UI (cards, scene art, map, forms) + admin/
  lib/
    data/              schema.ts (zod: source of truth) · store.ts · postgres-store.ts · local-store.ts
    seed/              research-backed seed content (generates supabase/seed.sql)
    queries.ts         public read model (published-only)
    venue-filters.ts   pure search/filter/sort logic
    payments/          PaymentProvider interface · test · stripe
    purchases.ts       checkout, settlement, token issue/resolve
    files.ts           private files (Supabase signed URLs / local) + image uploads
    auth/              admin auth (password HMAC session | Supabase Auth)
    admin/             entity configs, form parsing, server helpers
    actions/           server actions (public, checkout, admin)
  proxy.ts             optimistic /admin gate (Next 16 "proxy", formerly middleware)
supabase/
  migrations/          schema, constraints, indexes, triggers, RLS, buckets
  seed.sql             generated
  local-shim.sql       roles + auth.uid() for validating on plain Postgres
private/guides/        placeholder PDFs (never served statically)
tests/  e2e/           Vitest unit tests · Playwright end-to-end tests
```

**Key decisions**

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, zod, `postgres` (porsager), Leaflet, and Supabase (Auth + Storage). No other frameworks.
- **One schema, two stores.** `src/lib/data/schema.ts` defines every table. `PostgresStore` (production, Supabase Postgres via `DATABASE_URL`) and `LocalStore` (zero-config dev/demo) implement the same small CRUD interface. At v1 volumes (hundreds of rows), filtering happens in the query layer, so both stores behave identically. The full end-to-end suite passes against both.
- **Authorisation in the server.** The app connects with a server-only credential. Every admin page and server action calls `requireAdmin()`, and `proxy.ts` provides only an optimistic redirect. **RLS** in the migration protects the Supabase REST API that the public anon key exposes: published-only reads, no access to purchases or subscribers, and no read access to the private file key.
- **Maps:** Leaflet with Mapbox raster tiles when `NEXT_PUBLIC_MAPBOX_TOKEN` is set, falling back to OpenStreetMap tiles in development. Leaflet was chosen over Google Maps for a smaller bundle, no mandatory key, and easy swapping of tile providers.
- **Images:** `next/image` with remote patterns for Unsplash, Cloudinary, Supabase and YouTube thumbnails. Admin uploads go to Supabase Storage (`media` bucket), or `public/uploads` locally.
- **i18n-ready:** copy is English-only, while URLs, `lang`, OG locale and `SITE.locale` are centralised. See TODO for the `/[locale]` plan.

## Data model

The tables follow the brief, with these additions. All of them are in `supabase/migrations/20261106000000_init.sql`.

- `venues`: `setting`, `experiences[]`, `summary`, `city`, `coordinates_approximate`, `verification_notes`, `last_verified_at`, `cover_alt`, `scene`.
- `courts` / `facilities`: per-record `verification_status`.
- `reviews.overall_score` is a **generated column**. A CHECK constraint forbids scores unless `personally_visited`.
- `venue_sources`: a source URL, the fact it supports, and the date it was consulted. **`venue_images`**: photos.
- `guide_purchases.download_token_hash`: stores the SHA-256 of the buyer's token. The brief's `download_token` is deliberately stored hashed, never raw.
- `subscribers`, `inquiries` (contact form) and `admin_users` (RLS admin allowlist).
- FKs use `on delete cascade` for venue children and `set null` for editorial links. `guide_purchases → guides` is `restrict`. Indexes cover publication, verification, slugs and FKs. `updated_at` is maintained by triggers.

## Verification and the Tennis Escape Score

- Five labels: **Personally reviewed · Information verified with venue · Sourced from public information · Community submitted · Not yet verified**. Each appears with the last-verified date, or "Not yet verified with venue".
- **Score** = the mean of Scenery, Tennis quality, Stay experience, Accessibility and Family experience (each 1–10), to one decimal place. It is computed **only when all five exist**, and only from published, personally-visited reviews. Unreviewed venues show "Not yet reviewed". When sorting by score, unscored venues are never ranked as zero.
- A venue can't be set to "Personally reviewed" without a published personal review. This is enforced in the app.
- **Seed content honesty:** the 13 venues are *research candidates*. Their facts came from search-result excerpts of official and third-party pages on 6 Nov 2026, because the research environment couldn't open the pages themselves. Every venue is therefore labelled *Sourced from public information*, carries its source URLs and a public note, and has **no** verification date, scores, reviews or prices. Facts that weren't explicit, or where sources conflicted, are null. **Before launch, open each source and confirm with the venue** (see TODO).

## Payments and protected downloads

- `PaymentProvider` interface: `createCheckout`, `verify` and `parseWebhook`. Implementations are `TestProvider` (default) and `StripeProvider` (Checkout Sessions via REST, with v1 webhook signature verification and timestamp tolerance).
- **Test mode** is clearly labelled everywhere. Nothing is charged. A successful test purchase is stored as `payment_status = "test"` and can only download `guides/test-mode-sample.pdf`, a file marked as a sample, **never the paid guide**. Failed tests issue nothing, and test checkouts can't be replayed.
- **Stripe:** status changes only after server-side verification (webhook, or re-fetching the session on the success page). Amount and currency are checked against our own record, settlement is idempotent, and a paid purchase is never downgraded by a late or duplicate event.
- **Downloads:** a 256-bit token is shown to the buyer once, and only its hash is stored. Links expire after 30 days and allow 10 downloads, both configurable. The page is `noindex` and `no-referrer`. The route serves files from the private Supabase bucket via **60-second signed URLs**, or from `./private` locally. Responses are `no-store` and file keys are traversal-checked.
- **Indonesia:** Stripe is not available to Indonesia-based merchants. If the business entity is Indonesian, implement a `PaymentProvider` for **Xendit** or **Midtrans** (cards, QRIS, e-wallets, IDR). Alternatively, use Stripe through an entity in a supported country, or a merchant-of-record such as Paddle or Lemon Squeezy, which also handles VAT and GST. This is a business and legal decision; see TODO.

## Admin CMS

The admin lives at `/admin`. It provides:

- A dashboard with stats, the verification queue, drafts, recent orders and system status (which integrations are live).
- Destinations, venues, journal, films and guides: list, search, filter by status, create, edit, delete, and publish/unpublish.
- On each venue: courts, facilities, reviews, sources and photos as child records, plus one-click **"Verified with venue today"** and **"Re-checked public sources today"** buttons.
- Image upload (JPEG, PNG, WebP or AVIF, up to 8 MB) or a pasted URL. YouTube links are parsed to IDs.
- Read-only purchases, subscribers (with CSV export, protected against CSV injection) and contact messages.

**Auth modes:**

- **Password** (`ADMIN_AUTH_PROVIDER=password`): `ADMIN_PASSWORD` plus an HMAC-signed, httpOnly, 8-hour cookie. Only failed attempts count toward the rate limit.
- **Supabase** (recommended in production): Supabase Auth email/password, restricted to the `ADMIN_EMAILS` allowlist. Also insert admins into `public.admin_users` so RLS grants them direct API access.

## Testing

```bash
npm test                 # 43 unit tests
npm run test:e2e         # 29 Playwright tests (desktop + Pixel 7), JSON store
E2E_DATABASE_URL=postgres://cs:cs@localhost:5432/courtscape npm run test:e2e   # same suite on Postgres
```

**Unit tests** cover the score rules, filters and sorts, seed integrity (no fabricated reviews, scores or prices), session tokens, Stripe signatures, payment settlement (amount mismatch, idempotency, no downgrade), download tokens (rotation, expiry, limits, sample-only for test purchases), path traversal, admin form validation and Markdown sanitisation.

**End-to-end tests** cover homepage sections with no console errors, navigation, 404s, SEO tags, the sitemap and robots, search and filters, the map, venue details, newsletter and contact validation, test checkout (success and failure), protected downloads, admin auth (wrong password, forged cookie, sign-out), admin CRUD, the review and score flow, verification, publish/unpublish, the films embed, the mobile menu, horizontal overflow and the list/map toggle.

CI runs everything on GitHub Actions against Postgres 16 (`.github/workflows/ci.yml`).

## Deployment (Vercel + Supabase)

1. **Supabase:** create a project, then apply the migration and seed. Either use the CLI (`supabase link` then `supabase db push`, then run `supabase/seed.sql`), or paste both files into the SQL editor. The migration creates the `media` (public) and `guides-private` (private) storage buckets.
2. Upload the real guide PDF to `guides-private` and set the guide's **Private file key** in the admin. Until then, the placeholder in `private/guides/` is used locally.
3. Create admin users in Supabase Auth, insert them into `public.admin_users (user_id, email)`, and list their emails in `ADMIN_EMAILS`.
4. **Vercel:** import the repo (framework: Next.js) and set the environment variables below. Use Supabase's **pooled** connection string (port 6543) for `DATABASE_URL`.
5. **Payments:** keep `PAYMENT_PROVIDER=test` until a provider is chosen. For Stripe, set the keys, add a webhook endpoint `https://<domain>/api/webhooks/stripe` for `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`, then set `PAYMENT_PROVIDER=stripe`. To hide checkout entirely before launch, set `ALLOW_TEST_PAYMENTS=false`.
6. **Domain:** set `NEXT_PUBLIC_SITE_URL`. On preview deployments, set `ALLOW_INDEXING=false`.
7. **Search Console:** set `NEXT_PUBLIC_GSC_VERIFICATION`, then submit `/sitemap.xml`. **GA4:** set `NEXT_PUBLIC_GA_ID`. Events fire for `sign_up` and `begin_checkout`. Add a consent banner before enabling GA in the EU or UK.

## Static preview on GitHub Pages

A static build of the public site is published to **https://roisa.github.io/tennis/**.

- `npm run build:pages` produces `out/` with `output: "export"`, base path `/tennis` and trailing slashes. Override with `PAGES_BASE_PATH` and `PAGES_SITE_URL`.
- `.github/workflows/pages.yml` rebuilds and force-pushes `out/` to the `gh-pages` branch on every push to `main` or `courtscape-v1`.
- **Included:** every public page, the court directory (search, filters and map run in the browser), venue pages, the journal, films and guide pages.
- **Not included** (they need a server): `/admin`, checkout, downloads, the API routes, dynamic OG images and the proxy. These files are named `*.server.tsx|ts` and are excluded via `pageExtensions`. The newsletter and contact forms show a "preview site" message (`src/lib/actions/*.static.ts` are swapped in with `turbopack.resolveAlias`), and the buy button is replaced with a note.
- Content comes from the seed data at build time. Admin edits only appear on the full-stack deployment (Vercel + Supabase).

## Environment variable checklist

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ✅ prod | Canonical URLs, OG, redirect URLs. Inlined at build time |
| `DATABASE_URL` | ✅ prod | Supabase pooled Postgres URL. Without it, the read-only seed demo is used |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ prod | Supabase Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ prod | Server-only. Storage signed URLs and uploads |
| `SUPABASE_PRIVATE_BUCKET`, `SUPABASE_PUBLIC_BUCKET` | – | Defaults `guides-private`, `media` |
| `ADMIN_AUTH_PROVIDER` | ✅ | `supabase` or `password` |
| `ADMIN_EMAILS` | ✅ | Comma-separated allowlist |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | password mode | Secret must be at least 32 characters |
| `PAYMENT_PROVIDER` | – | `test` (default) or `stripe` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | stripe | |
| `ALLOW_TEST_PAYMENTS` | – | `false` disables test checkout in production |
| `DOWNLOAD_TTL_DAYS`, `MAX_DOWNLOADS` | – | Defaults 30 / 10 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | recommended | Restrict the token to your domain |
| `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GSC_VERIFICATION` | – | Analytics and Search Console |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_PARTNERS_EMAIL`, `NEXT_PUBLIC_*_URL` (social) | – | Placeholders until set |
| `ALLOW_INDEXING` | – | `false` on staging |

## External dependencies still required

These are blocked on credentials or decisions; none is required for the app to run.

1. **Supabase project:** database, Auth and Storage credentials.
2. **Payment provider decision** (Stripe vs Xendit/Midtrans vs a merchant of record), plus credentials. This depends on the business entity's country.
3. **Mapbox token** for production map tiles.
4. **GA4 property and Search Console** verification.
5. **Email delivery** (e.g. Resend or Postmark) for download-link emails and the newsletter double opt-in. Newsletter signups are currently stored only, not emailed.
6. **The Bali Tennis Escape Guide** itself: the PDF content.
7. **Photography:** the scene illustrations are placeholders.
8. **YouTube films:** no video IDs exist yet. Films show "In production".
9. **Legal review** of the Privacy and Terms placeholders, the consent mechanism, and consumer and tax rules for digital goods.
10. **Venue verification:** open each source, contact each venue and record visits.

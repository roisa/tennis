# TODO

## Before launch (blocking)
- [ ] **Verify every seeded venue:** open each source URL, since the research used search excerpts only. Contact the venue, then use "Verified with venue today" in the admin. Fill in court counts, surfaces and access.
- [ ] Find a precise location for Kula Mani Tennis Village. It currently has no coordinates.
- [ ] Replace the approximate coordinates with exact ones and untick "approximate".
- [ ] Produce the Bali Tennis Escape Guide PDF, upload it to `guides-private`, and update the page count and preview pages.
- [ ] Choose a payment provider for the business entity (Stripe, Xendit/Midtrans, or a merchant of record), implement or configure it, and run a real small-value test purchase.
- [ ] Set up an email provider: download-link receipt emails, plus double opt-in for the newsletter.
- [ ] Legal review of Privacy and Terms; cookie/consent banner before GA4 in the EU/UK; refund policy for digital goods.
- [ ] Commission photography and replace the scene illustrations. Write alt text for every photo.
- [ ] Supabase: apply the migration, seed, create admins (`admin_users` and `ADMIN_EMAILS`), and set `ADMIN_AUTH_PROVIDER=supabase`.
- [ ] Mapbox token, restricted by URL. GA4 and Search Console.
- [ ] Set real contact and social links.

## Engineering follow-ups
- [ ] Use a shared rate limiter (e.g. Upstash or a Postgres table). The current one is per instance.
- [ ] Push filtering and pagination down to SQL once venues number in the thousands. The query layer is isolated in `queries.ts` and `venue-filters.ts`.
- [ ] Add on-demand ISR tags per entity instead of whole-site `revalidatePath`.
- [ ] Add an admin audit log (who changed what, and when).
- [ ] Image focal-point and crop controls; Cloudinary transformation support.
- [ ] Add Lighthouse CI and axe accessibility checks to CI.
- [ ] Run a Stripe end-to-end test with Stripe CLI webhook forwarding in a test account.

# Version 2 roadmap (prioritised)

1. **Verified content at scale:** an editor workflow for venue outreach (status, notes, follow-up dates), with a public "last verified" freshness badge.
2. **Real reviews:** publish the first personally reviewed venues with full Tennis Escape Scores. Add score methodology pages per category.
3. **Payments for Indonesia:** a Xendit or Midtrans provider (QRIS, e-wallets, IDR pricing) alongside USD. Localised pricing.
4. **Transactional email:** purchase receipts, link re-send ("lost my link"), and newsletter delivery with segments by destination.
5. **Internationalisation:** `/[locale]` routing with Indonesian first; `hreflang`; translated venue and article fields in the schema.
6. **Community submissions:** a public "suggest a court" form with moderation that feeds the `community_submitted` status, and photo submissions with licensing consent.
7. **Booking and affiliate links:** partner booking URLs with disclosure, plus click tracking as conversions.
8. **Interactive trip planner:** save venues, build an itinerary, export a PDF.
9. **More guides and bundles:** Alpine Clay, Japan, a Maldives bundle; discount codes.
10. **Video:** YouTube Data API sync for the films channel; chapters linking to venues.
11. **Performance:** an image CDN, static generation for every venue at build, and an edge-cached read model.

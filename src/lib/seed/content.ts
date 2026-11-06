import type { Article, Guide, Video } from "../data/schema";
import { destinationId } from "./destinations";
import { venueId } from "./venues";
import { sid, ts } from "./util";

const a = (key: string, o: Omit<Article, "id" | "created_at" | "updated_at" | "cover_image" | "cover_alt">): Article => ({
  id: sid(`article:${key}`), cover_image: null, cover_alt: null, ...o, ...ts,
});

export const articles: Article[] = [
  a("escape-score", {
    title: "The Tennis Escape Score: how we rate a court",
    slug: "tennis-escape-score-how-we-rate",
    excerpt: "Five categories, one honest number — and why we refuse to publish a score until we've played there ourselves.",
    author: "COURTSCAPE Editors", category: "Method", tags: ["methodology", "ratings"], scene: "garden",
    related_destination_id: null, related_venue_id: null, published_at: "2026-11-01",
    seo_title: "The Tennis Escape Score — How COURTSCAPE Rates Tennis Courts",
    seo_description: "How COURTSCAPE rates tennis destinations across scenery, tennis quality, stay, accessibility and family experience.",
    featured: true, published: true,
    body: `A beautiful court is not the same thing as a great tennis escape. The most photographed court in a region can have a cracked surface and no shade; a modest club court can come with a coach, a café and the best sunset on the island. The **Tennis Escape Score** exists to tell those stories apart.

## Five categories, scored from 1 to 10

- **Scenery** — what you see between points: setting, views, architecture, the feeling of the place.
- **Tennis quality** — surface condition, nets, lines, lighting, run-off space, equipment and coaching.
- **Stay experience** — how well tennis fits into a stay: rooms, food, pace, service and things to do off court.
- **Accessibility** — how easy it is to get there and get on court: transfers, booking, guest and public access.
- **Family experience** — how well the venue works for partners and children who play a little, or not at all.

## The rules we hold ourselves to

The overall score is the simple average of the five categories, rounded to one decimal place. **We only calculate it when all five scores exist.** A venue with four great scores and one unknown has no Tennis Escape Score — it has a review in progress.

Scores come only from a COURTSCAPE visit. Information gathered from public sources, from the venue itself or from readers is labelled as such, with the date we last checked it. Where a fact is unknown, we say so rather than guess.

> A listing marked "Not yet reviewed" is an invitation, not a gap. It means we haven't played there — yet.

## Verification labels

Every venue carries one of five labels: *Personally reviewed*, *Information verified with venue*, *Sourced from public information*, *Community submitted* or *Not yet verified*. They describe how we know what we know, so you can judge for yourself how much to rely on it before you book.`,
  }),
  a("bali-shortlist", {
    title: "Bali tennis: our research shortlist",
    slug: "bali-tennis-research-shortlist",
    excerpt: "From the Bukit clifftops to the caldera highlands — the Bali courts we are investigating first, and what we know so far.",
    author: "COURTSCAPE Editors", category: "Destinations", tags: ["bali", "indonesia", "resorts"], scene: "cliff",
    related_destination_id: destinationId("bali"), related_venue_id: null, published_at: "2026-11-03",
    seo_title: "Tennis Resorts in Bali — Research Shortlist",
    seo_description: "The Bali tennis resorts and courts COURTSCAPE is researching: clifftop, beach, jungle and highland courts, with sources.",
    featured: true, published: true,
    body: `Bali is where COURTSCAPE begins. The island packs remarkably different tennis settings into a short drive: limestone clifftops in the south, a long sandy bay at Jimbaran, the river valleys around Ubud and cool, often misty highlands in the north.

This is a **research shortlist**, not a ranking. Each venue below appears in public sources as offering tennis. None has yet been visited or rated by COURTSCAPE, and every listing shows its sources and what remains unconfirmed.

## The south: cliffs and bays

On the Bukit Peninsula, [The Ungasan Clifftop Resort](/courts/the-ungasan-clifftop-resort) describes a synthetic grass court. Around Jimbaran, [Raffles Bali](/courts/raffles-bali) lists clay-surface courts for in-house guests, and the [InterContinental Bali Resort](/courts/intercontinental-bali-resort) lists a beachfront court.

## Ubud and the interior

[Amandari](/courts/amandari), on the edge of Ubud, describes a floodlit hard court with hitting partners. Elsewhere in the island's green interior, [Kula Mani Tennis Village](/courts/kula-mani-tennis-village) is built around tennis itself, with hard and red clay courts.

## The highlands

In the caldera valley near Bedugul, [Handara Golf & Resort](/courts/handara-golf-resort-bali) describes an outdoor mountain court that public sources say non-guests can hire too.

## What happens next

We are contacting each venue to confirm court counts, surfaces, access and booking. As we confirm details, labels change from *Sourced from public information* to *Information verified with venue* — and after a visit, to *Personally reviewed*, with a full Tennis Escape Score.`,
  }),
  a("beautiful-courts", {
    title: "What makes a tennis court beautiful?",
    slug: "what-makes-a-tennis-court-beautiful",
    excerpt: "Setting, light, architecture and silence: the criteria behind our search for the most beautiful tennis courts in the world.",
    author: "COURTSCAPE Editors", category: "Courts", tags: ["design", "beautiful courts"], scene: "zen",
    related_destination_id: null, related_venue_id: null, published_at: "2026-10-28",
    seo_title: "The Most Beautiful Tennis Courts — What Makes One Great",
    seo_description: "The criteria COURTSCAPE uses in its search for the most beautiful tennis courts in the world: setting, light, design and calm.",
    featured: false, published: true,
    body: `Lists of the world's most beautiful tennis courts tend to reward a single photograph: a drone shot, a dramatic drop, an impossible blue. We love those images too. But a court that is beautiful to *play on* asks for more.

## Setting

The best courts borrow their landscape. A court on a ridge frames the valley behind the baseline; a court in a garden is wrapped by it. We look at what you see from the baseline, not just from the air.

## Light

Morning and late-afternoon light define tennis in warm climates. Orientation matters: a court laid out roughly north–south avoids players serving straight into a low sun. Good floodlights extend the day without flattening the evening.

## Architecture and detail

Fencing, windbreaks, benches, shade structures, the colour of the surface against its surroundings — small decisions add up. The most memorable courts feel designed as part of the place rather than dropped into it.

## Calm

Beauty includes sound. A court beside a service road is a different experience from one where the only noise is the ball and the wind.

## Playability

Finally, beauty that you cannot play on is just scenery. A level, well-maintained surface, a taut net, clear lines and enough run-off space are part of the aesthetic.

We will be applying these criteria — alongside the [Tennis Escape Score](/journal/tennis-escape-score-how-we-rate) — as we visit courts around the world.`,
  }),
  a("altitude", {
    title: "Mountain tennis: what changes at altitude",
    slug: "mountain-tennis-what-changes-at-altitude",
    excerpt: "Thinner air, livelier balls and big views. A primer for playing the best mountain tennis courts.",
    author: "COURTSCAPE Editors", category: "Planning", tags: ["mountain", "switzerland", "technique"], scene: "alpine",
    related_destination_id: destinationId("switzerland"), related_venue_id: venueId("gstaad-palace"), published_at: "2026-10-20",
    seo_title: "Mountain Tennis — Playing at Altitude",
    seo_description: "What changes when you play tennis at altitude, and how to prepare for a mountain tennis holiday.",
    featured: false, published: true,
    body: `There is a particular pleasure to summer tennis in the mountains: cool mornings, clear air and courts that look up at peaks instead of buildings. There is also a physical difference you will notice within a few rallies.

## The ball flies

Air is less dense at altitude, so there is less drag on the ball. Shots travel faster and further, and balls tend to bounce higher. Many players find their usual length sails long for the first session or two.

**What helps:** add more topspin to bring the ball down, aim a little shorter, and give yourself a session to recalibrate before judging your game. Some players adjust string tension; that is a personal choice best discussed with a coach or stringer.

## Your body notices too

At higher elevations you may tire sooner and need more fluids. Build up gradually, hydrate well and use strong sun protection — UV exposure increases with altitude.

## Clay country

Many Alpine resort courts are clay, played mainly in summer. Clay slows the ball and lengthens rallies, which partly offsets the livelier mountain air. Bring shoes with a clay or all-court sole.

## Where to start

Our Switzerland research begins in Gstaad and St. Moritz, where grand hotels such as [Gstaad Palace](/courts/gstaad-palace) and [Suvretta House](/courts/suvretta-house) describe summer clay courts.`,
  }),
  a("tropical-packing", {
    title: "Packing for tropical tennis",
    slug: "packing-for-tropical-tennis",
    excerpt: "Heat, humidity and sudden rain: what to bring for a tennis holiday in Bali, Lombok or the Maldives.",
    author: "COURTSCAPE Editors", category: "Planning", tags: ["planning", "indonesia", "maldives"], scene: "jungle",
    related_destination_id: destinationId("bali"), related_venue_id: null, published_at: "2026-10-12",
    seo_title: "Packing for a Tennis Holiday in the Tropics",
    seo_description: "A practical packing list for tennis holidays in Bali, Lombok and the Maldives — heat, humidity and rain.",
    featured: false, published: true,
    body: `Tropical tennis is glorious and demanding in equal measure. Plan for heat, humidity and the occasional downpour, and the rest is easy.

## Play early, play late

Book courts for the first hours after sunrise or the last hour before sunset. Midday sessions in the tropics are hard work even for fit players. Ask whether courts are floodlit — some resorts extend play into the evening.

## The essentials

- **Breathable clothing** — light colours, several changes. Kit rarely dries overnight in humid air.
- **Hat or visor, sunglasses and high-SPF sunscreen** — reapply between sets.
- **Electrolytes** as well as water. Ask your venue whether drinking water is provided courtside.
- **Two pairs of shoes**, with the right sole for the surface: hard, clay and synthetic grass all behave differently.
- **Towels and grips.** Overgrips wear quickly in humidity; bring more than you think you need.
- **A sealed bag** for rackets and electronics during rain showers.

## Before you go

Confirm the booking basics directly with the venue: whether courts are open to non-guests, how far ahead to book, whether rackets and balls are provided, and whether coaching is available. Our venue pages flag what is confirmed and what isn't.`,
  }),
  a("indonesia-primer", {
    title: "Tennis holidays in Indonesia: a planning primer",
    slug: "tennis-holidays-in-indonesia",
    excerpt: "Islands, seasons and logistics for planning a tennis trip across Indonesia.",
    author: "COURTSCAPE Editors", category: "Planning", tags: ["indonesia", "planning"], scene: "terraces",
    related_destination_id: destinationId("bali"), related_venue_id: null, published_at: null,
    seo_title: "Tennis Holidays in Indonesia — Planning Primer",
    seo_description: "How to plan a tennis holiday in Indonesia: islands, seasons, access and booking.",
    featured: false, published: false,
    body: `DRAFT — in editorial review. Sections to be completed after venue verification: seasons and weather, getting between islands, booking courts as a non-guest, coaching and hitting partners.`,
  }),
];

const v = (key: string, o: Omit<Video, "id" | "created_at" | "updated_at" | "thumbnail">): Video => ({ id: sid(`video:${key}`), thumbnail: null, ...o, ...ts });

/** Films are in production — no YouTube IDs exist yet, so none are invented. */
export const videos: Video[] = [
  v("bali-clifftops", {
    title: "Courts on the Edge: Bali's Bukit Peninsula", slug: "courts-on-the-edge-bali", youtube_video_id: null, scene: "cliff", category: "Destination Film",
    related_venue_id: venueId("ungasan"), related_article_id: sid("article:bali-shortlist"),
    description: "A short film exploring tennis along Bali's southern clifftops. In production.", duration: null, published_at: null, published: true,
  }),
  v("highland-court", {
    title: "Above the Clouds: A Highland Court in Bali", slug: "above-the-clouds-bali-highlands", youtube_video_id: null, scene: "mountain", category: "Court Portrait",
    related_venue_id: venueId("handara"), related_article_id: null,
    description: "Morning mist and mountain air in Bali's caldera valley. In production.", duration: null, published_at: null, published: true,
  }),
  v("alpine-clay", {
    title: "Summer Clay in the Alps", slug: "summer-clay-in-the-alps", youtube_video_id: null, scene: "alpine", category: "Travel Diary",
    related_venue_id: venueId("gstaad-palace"), related_article_id: sid("article:altitude"),
    description: "A travel diary from the grand hotels of the Swiss Alps. In production.", duration: null, published_at: null, published: true,
  }),
];

const g = (key: string, o: Omit<Guide, "id" | "created_at" | "updated_at" | "cover_image">): Guide => ({ id: sid(`guide:${key}`), cover_image: null, ...o, ...ts });

export const guides: Guide[] = [
  g("bali", {
    title: "Bali Tennis Escape Guide", slug: "bali-tennis-escape-guide",
    subtitle: "Where to play, stay and slow down on the Island of the Gods.",
    description:
      "A beautifully designed digital guide to tennis travel in Bali: the island's most interesting courts, how to book them, where to stay, and how to build a trip that balances matches with everything else Bali does so well. Built from COURTSCAPE's on-the-ground research.",
    contents: [
      "Bali at a glance: regions, seasons and getting around",
      "The courts: clifftop, beach, jungle and highland venues",
      "Booking court time as a guest and as a visitor",
      "Coaching, hitting partners and equipment",
      "Sample itineraries: a long weekend, a week and a family trip",
      "Where to stay: resorts with tennis",
      "Beyond the court: food, wellness and day trips",
    ],
    includes: ["Printable PDF optimised for phone and tablet", "Interactive map links for every venue", "Booking checklist", "Free updates for the first edition"],
    page_count: null, format: "PDF", price: 19, currency: "USD", scene: "cliff",
    related_destination_id: destinationId("bali"),
    downloadable_file: "guides/bali-tennis-escape-guide.pdf",
    status_note: "Pre-launch edition. The guide's content is being finalised after venue verification.",
    published: true, featured: true,
  }),
  g("alps", {
    title: "Alpine Clay Guide", slug: "alpine-clay-guide",
    subtitle: "Summer tennis in the grand hotels of the Swiss Alps.",
    description: "Our forthcoming guide to summer clay-court tennis in Switzerland's mountain resorts.",
    contents: ["Gstaad and the Saanenland", "St. Moritz and the Engadin", "Playing at altitude", "When to go"],
    includes: ["PDF guide", "Venue map links"],
    page_count: null, format: "PDF", price: 19, currency: "USD", scene: "alpine",
    related_destination_id: destinationId("switzerland"), downloadable_file: null,
    status_note: "Coming soon.", published: true, featured: false,
  }),
  g("japan", {
    title: "Japan Tennis Escape Guide", slug: "japan-tennis-escape-guide",
    subtitle: "From Karuizawa's forests to Okinawa's coast.",
    description: "Our forthcoming guide to tennis travel in Japan.",
    contents: ["Karuizawa", "Okinawa", "Etiquette and booking"],
    includes: ["PDF guide", "Venue map links"],
    page_count: null, format: "PDF", price: 19, currency: "USD", scene: "zen",
    related_destination_id: destinationId("japan"), downloadable_file: null,
    status_note: "Coming soon.", published: true, featured: false,
  }),
];

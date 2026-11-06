import type { Court, Facility, Venue, VenueSource } from "../data/schema";
import { destinationId } from "./destinations";
import { RESEARCH_DATE, sid, ts } from "./util";

/**
 * RESEARCH CANDIDATES — not confirmed listings.
 * Facts below were gathered on 2026-11-06 from search-result excerpts of official or
 * third-party pages (full pages could not be opened from the research environment).
 * Anything not explicitly stated in a source is null. Prices reported in sources are
 * recorded in source notes only, never as confirmed rental prices.
 */
const NOTE =
  "Compiled from public sources (search excerpts of official pages) on 6 Nov 2026. Not yet confirmed with the venue or visited by COURTSCAPE. Check details directly with the venue before travelling.";

type VenueSeed = {
  key: string;
  venue: Omit<Venue, "id" | "created_at" | "updated_at" | "destination_id" | "verification_status" | "verification_notes" | "last_verified_at" | "cover_image" | "cover_alt" | "booking_url" | "phone" | "email" | "address" | "published"> & {
    destination: string;
    address?: string | null;
    extraNote?: string;
  };
  courts: Array<Partial<Omit<Court, "id" | "venue_id">> & { court_name: string }>;
  facilities?: Array<Pick<Facility, "category" | "name"> & { description?: string | null }>;
  sources: Array<{ url: string; title: string; fact?: string }>;
};

const seeds: VenueSeed[] = [
  {
    key: "handara",
    venue: {
      destination: "bali", name: "Handara Golf & Resort Bali", slug: "handara-golf-resort-bali", venue_type: "resort", setting: "mountain",
      experiences: ["mountain", "hidden"], city: "Pancasari, Bedugul",
      summary: "A highland resort in Bali's caldera valley, with an outdoor tennis court framed by mountain views.",
      description:
        "Handara sits in the cool uplands of northern Bali, in the caldera valley near Pancasari and the Bedugul lakes. The resort's own tennis page describes an outdoor mountain court. Public sources indicate the court can also be hired by non-guests, and that the tennis house was being upgraded while the court remained open.",
      website: "https://www.handaragolfresort.com/", latitude: -8.27, longitude: 115.16, coordinates_approximate: true,
      access_type: "public", accommodation_available: true, scene: "mountain", featured: true,
      extraNote: "Sources disagree on the number of courts (one court on the official page; two named courts in a third-party listing).",
    },
    courts: [{ court_name: "Caldera Valley Mountain Tennis Court", indoor_outdoor: "outdoor", verification_status: "public_sources" }],
    sources: [
      { url: "https://www.handaragolfresort.com/experience/tennis/", title: "Tennis — Handara (official)", fact: "Outdoor mountain court; court hire for non-guests with a separate hotel-guest rate reported (rates not confirmed); tennis house upgrade noted." },
      { url: "https://www.handaragolfresort.com/", title: "Handara Golf & Resort Bali (official)" },
    ],
  },
  {
    key: "ungasan",
    venue: {
      destination: "bali", name: "The Ungasan Clifftop Resort", slug: "the-ungasan-clifftop-resort", venue_type: "resort", setting: "beach",
      experiences: ["ocean", "luxury"], city: "Ungasan, Uluwatu",
      summary: "A clifftop resort on the Bukit Peninsula with a synthetic grass court described on its facilities page.",
      description:
        "Perched on the limestone cliffs of Bali's southern Bukit Peninsula, The Ungasan describes a professional synthetic grass court on its facilities page, with court time booked through the guest butler service and equipment provided.",
      website: "https://theungasan.com/", latitude: -8.83, longitude: 115.17, coordinates_approximate: true,
      access_type: "guests_only", accommodation_available: true, scene: "cliff", featured: true,
      extraNote: "Facilities page refers to one court; an FAQ page refers to 'courts'. Guest-only access is inferred from the butler booking process, not explicitly stated.",
    },
    courts: [{ court_name: "Tennis court", surface: "artificial_grass", verification_status: "public_sources", booking_requirements: "Reported: book court time or private sessions via the guest butler. Racquets and balls provided; coaching on request." }],
    sources: [
      { url: "https://theungasan.com/facilities", title: "Facilities — The Ungasan (official)", fact: "Professional synthetic grass court; reported hours 6 AM–10 PM." },
      { url: "https://theungasan.com/the-ungasan-llm-info", title: "The Ungasan FAQ (official)" },
    ],
  },
  {
    key: "kula-mani",
    venue: {
      destination: "bali", name: "Kula Mani Tennis Village", slug: "kula-mani-tennis-village", venue_type: "club", setting: "countryside",
      experiences: ["jungle", "hidden"], city: null,
      summary: "A dedicated tennis village with hard courts and red clay courts, set among Bali's rice fields.",
      description:
        "Kula Mani presents itself as a tennis village: official pages describe hard courts — including grandstand courts overlooking rice fields — alongside two red clay courts, plus padel and pickleball. The precise location is not yet confirmed by an official page.",
      website: "https://kulamani.com/", latitude: null, longitude: null, coordinates_approximate: true,
      access_type: "unknown", accommodation_available: null, scene: "terraces", featured: true,
      extraNote: "Total court count is unconfirmed (official pages describe five hard courts plus two clay courts on separate pages). A Mouratoglou Tennis Center listing for Bali may refer to the same complex — not confirmed.",
    },
    courts: [
      { court_name: "Hard courts", surface: "hard", verification_status: "public_sources" },
      { court_name: "Red clay courts", surface: "clay", court_count: 2, verification_status: "public_sources" },
    ],
    facilities: [{ category: "tennis", name: "Padel and pickleball courts", description: "Reported on official pages." }],
    sources: [
      { url: "https://kulamani.com/tennis-village/tennis/", title: "Tennis — Kula Mani (official)", fact: "“Two pristine red clay courts” in addition to hard courts." },
      { url: "https://kulamani.com/tennis-village/", title: "Tennis Village — Kula Mani (official)" },
      { url: "https://www.mouratoglou.com/en/international/bali/", title: "Mouratoglou Tennis Center Bali", fact: "Possibly the same complex — unconfirmed." },
    ],
  },
  {
    key: "amandari",
    venue: {
      destination: "bali", name: "Amandari", slug: "amandari", venue_type: "resort", setting: "jungle",
      experiences: ["jungle", "luxury"], city: "Kedewatan, Ubud", address: "Jl. Raya Kedewatan, Ubud (per third-party listing)",
      summary: "Aman's resort above Ubud, with a floodlit hard court and hitting partners on request.",
      description:
        "Amandari sits in Kedewatan, just outside Ubud. Aman's published fact sheet describes a floodlit hard court with hitting partners available, and the resort's experience guide lists rackets on request.",
      website: "https://www.aman.com/resorts/amandari", latitude: -8.49, longitude: 115.25, coordinates_approximate: true,
      access_type: "unknown", accommodation_available: true, scene: "jungle", featured: true,
      extraNote: "Court hours differ between sources. Court count is not stated explicitly.",
    },
    courts: [{ court_name: "Tennis court", surface: "hard", lighting: true, verification_status: "public_sources", booking_requirements: "Reported: rackets provided; hitting partners on request." }],
    sources: [
      { url: "https://www.aman.com/sites/default/files/2024-08/Amandari_Factsheet.pdf", title: "Amandari Fact Sheet (official PDF)", fact: "Floodlit hard court with hitting partners available." },
      { url: "https://www.aman.com/amandari-experience-guide.pdf", title: "Amandari experience guide (official PDF)" },
      { url: "https://www.aman.com/tennis", title: "Tennis at Aman (official)" },
    ],
  },
  {
    key: "raffles-bali",
    venue: {
      destination: "bali", name: "Raffles Bali", slug: "raffles-bali", venue_type: "resort", setting: "beach",
      experiences: ["ocean", "luxury"], city: "Jimbaran",
      summary: "A Jimbaran hillside resort listing two clay-surface tennis and pickleball courts for in-house guests.",
      description:
        "Raffles Bali's official pages describe two clay-surface courts shared between tennis and pickleball. The resort's activities booklet states that the courts are reserved for in-house guests, bookable in advance, with coaching available at an additional fee.",
      website: "https://www.raffles.com/bali/", latitude: -8.79, longitude: 115.16, coordinates_approximate: true,
      access_type: "guests_only", accommodation_available: true, scene: "ocean", featured: false,
      extraNote: "Older materials refer to a single court; newer pages to two courts shared with pickleball.",
    },
    courts: [{ court_name: "Tennis & pickleball courts", surface: "clay", court_count: 2, verification_status: "public_sources", booking_requirements: "Reported: in-house guests only; book at least two hours ahead; coach or partner at extra fee." }],
    sources: [
      { url: "https://www.raffles.com/bali/spa/Tennis-or-Pickleball/", title: "Tennis / Pickleball — Raffles Bali (official)", fact: "Two clay-surface tennis and pickleball courts." },
      { url: "https://www.raffles.com/content/dam/raffles-aem/pdfs/bali/Resort%20Activities%20Booklet%20March-2026%20(1).pdf", title: "Resort Activities Booklet, March 2026 (official PDF)", fact: "Complimentary for in-house guests; advance booking." },
    ],
  },
  {
    key: "intercontinental-bali",
    venue: {
      destination: "bali", name: "InterContinental Bali Resort", slug: "intercontinental-bali-resort", venue_type: "resort", setting: "beach",
      experiences: ["ocean"], city: "Jimbaran Bay",
      summary: "A large resort on Jimbaran Bay whose recreation page lists a beachfront tennis court.",
      description:
        "The InterContinental on Jimbaran Bay lists tennis among its recreational activities. Not to be confused with InterContinental Bali Sanur Resort.",
      website: "https://bali.intercontinental.com/", latitude: -8.79, longitude: 115.16, coordinates_approximate: true,
      access_type: "unknown", accommodation_available: true, scene: "ocean", featured: false,
      extraNote: "Court count and surface vary across third-party listings; no official figure found.",
    },
    courts: [{ court_name: "Beachfront court", verification_status: "public_sources" }],
    sources: [
      { url: "https://bali.intercontinental.com/resort", title: "Recreational Activities — InterContinental Bali (official)", fact: "Beachfront court; reported daily hours 7 AM–9 PM." },
      { url: "https://digital.ihg.com/is/content/ihg/intercontinental-bali-9678301350-original?fmt=pdf", title: "Meetings & events brochure (IHG PDF)", fact: "Lists tennis courts among facilities." },
    ],
  },
  {
    key: "sheraton-senggigi",
    venue: {
      destination: "lombok", name: "Sheraton Senggigi Beach Resort", slug: "sheraton-senggigi-beach-resort", venue_type: "resort", setting: "beach",
      experiences: ["ocean", "hidden"], city: "Senggigi",
      summary: "A beachfront resort on Lombok's west coast whose experiences page mentions its tennis court.",
      description:
        "On the Senggigi coast of West Lombok, the Sheraton's experiences page mentions a tennis court. Some of the public material is several years old, so the court's current status needs confirming.",
      website: "https://www.marriott.com/en-us/hotels/lopsi-sheraton-senggigi-beach-resort/overview/", latitude: -8.49, longitude: 116.04, coordinates_approximate: true,
      access_type: "unknown", accommodation_available: true, scene: "volcano", featured: true,
      extraNote: "Fees and current operation should be confirmed with the resort.",
    },
    courts: [{ court_name: "Tennis court", verification_status: "public_sources" }],
    sources: [
      { url: "https://www.marriott.com/en-us/hotels/lopsi-sheraton-senggigi-beach-resort/experiences/", title: "Experiences — Sheraton Senggigi (Marriott)", fact: "Mentions the resort's tennis court." },
      { url: "https://oyster.com/lombok/hotels/sheraton-senggigi-beach-resort", title: "Oyster — Sheraton Senggigi" },
    ],
  },
  {
    key: "jumeirah-olhahali",
    venue: {
      destination: "maldives", name: "Jumeirah Olhahali Island", slug: "jumeirah-olhahali-island", venue_type: "resort", setting: "island",
      experiences: ["ocean", "luxury"], city: "North Malé Atoll",
      summary: "An island resort in North Malé Atoll with a floodlit beachfront court and social tennis sessions.",
      description:
        "Jumeirah's tennis page describes a floodlit court so play can continue after sunset, with complimentary rackets and balls and regular social sessions. The resort appears to have been renamed from Jumeirah Maldives Olhahali Island.",
      website: "https://www.jumeirah.com/en/stay/maldives/jumeirah-olhahali-island", latitude: 4.4, longitude: 73.5, coordinates_approximate: true,
      access_type: "guests_only", accommodation_available: true, scene: "lagoon", featured: true,
      extraNote: "Coordinates are an approximate atoll position. Guest-only access is assumed for a private-island resort, not stated.",
    },
    courts: [{ court_name: "Beachfront court", lighting: true, verification_status: "public_sources", booking_requirements: "Reported: complimentary rackets and balls; kids' clinics and adult social tennis on set days." }],
    sources: [
      { url: "https://www.jumeirah.com/en/stay/maldives/jumeirah-olhahali-island/experiences/tennis", title: "Tennis — Jumeirah Olhahali Island (official)", fact: "“The floodlit court ensures the fun doesn't stop when the sun sets.”" },
    ],
  },
  {
    key: "vakkaru",
    venue: {
      destination: "maldives", name: "Vakkaru Maldives", slug: "vakkaru-maldives", venue_type: "resort", setting: "island",
      experiences: ["ocean", "luxury"], city: "Baa Atoll",
      summary: "A Baa Atoll resort with two floodlit all-weather courts for day and night play.",
      description:
        "Vakkaru's sports fields page describes all-weather floodlit tennis courts, and its 2025 fact sheet lists two. A padel court has also been added.",
      website: "https://www.vakkarumaldives.com/", latitude: 5.1, longitude: 73.0, coordinates_approximate: true,
      access_type: "guests_only", accommodation_available: true, scene: "lagoon", featured: false,
      extraNote: "Coordinates are an approximate atoll position. Surface type is described only as 'all-weather'.",
    },
    courts: [{ court_name: "Tennis courts", court_count: 2, lighting: true, verification_status: "public_sources" }],
    facilities: [{ category: "tennis", name: "Padel court", description: "Reported as newly added." }],
    sources: [
      { url: "https://www.vakkarumaldives.com/experiences/sports-fields", title: "Sports Fields — Vakkaru Maldives (official)", fact: "All-weather floodlit tennis courts for day and night play." },
      { url: "https://www.vakkarumaldives.com/pdfs/vakkaru-maldives-fact-sheet-2025.pdf", title: "Fact Sheet 2025 (official PDF)", fact: "Two tennis courts." },
    ],
  },
  {
    key: "gstaad-palace",
    venue: {
      destination: "switzerland", name: "Gstaad Palace", slug: "gstaad-palace", venue_type: "hotel", setting: "mountain",
      experiences: ["mountain", "luxury"], city: "Gstaad",
      summary: "The grand hotel above Gstaad, with four outdoor clay courts and a long tennis history.",
      description:
        "Gstaad Palace describes four clay courts beside the hotel, used mainly in summer, with nearby indoor courts available in bad weather. The hotel is closely tied to the history of Swiss tennis and hosts long-running tennis weeks with Roy Emerson.",
      website: "https://www.palace.ch/", latitude: 46.475, longitude: 7.286, coordinates_approximate: true,
      access_type: "on_request", accommodation_available: true, scene: "alpine", featured: true,
      extraNote: "Primarily a summer facility. A tourism listing suggests the courts can be booked, but public access is not stated outright.",
    },
    courts: [{ court_name: "Clay courts", surface: "clay", indoor_outdoor: "outdoor", court_count: 4, verification_status: "public_sources" }],
    sources: [
      { url: "https://www.palace.ch/en/spa-sport/gym-tennis/", title: "Gym and Tennis — Gstaad Palace (official)", fact: "Four clay courts next to the hotel; summer hours." },
      { url: "https://www.gstaad.ch/en/plan-book/poi/detail/tennisplatz-gstaad-palace-1", title: "Tennis court Gstaad Palace — Gstaad Tourism", fact: "Reservation line and booking fee listed (not confirmed)." },
      { url: "https://www.palace.ch/en/make-your-stories-special/game-set-match-with-roy-emerson/", title: "Game, Set, Match With Roy Emerson (official)" },
    ],
  },
  {
    key: "suvretta-house",
    venue: {
      destination: "switzerland", name: "Suvretta House", slug: "suvretta-house", venue_type: "hotel", setting: "mountain",
      experiences: ["mountain", "luxury"], city: "St. Moritz",
      summary: "A St. Moritz grand hotel with three clay courts in front of the house and a resident tennis pro.",
      description:
        "Suvretta House's summer pages describe three clay courts in front of the hotel, lessons with the hotel's tennis professional and a ball machine. Spa Club members are reported to have summer court access.",
      website: "https://suvrettahouse.ch/", latitude: 46.498, longitude: 9.839, coordinates_approximate: true,
      access_type: "members", accommodation_available: true, scene: "alpine", featured: false,
      extraNote: "Summer-only facility. Seasonal dates and prices not found.",
    },
    courts: [{ court_name: "Clay courts", surface: "clay", court_count: 3, verification_status: "public_sources", booking_requirements: "Reported: lessons with the hotel tennis pro; ball machine available." }],
    sources: [
      { url: "https://suvrettahouse.ch/en/sports/sommer-herbst", title: "Summer & Autumn — Suvretta House (official)", fact: "Three clay courts in front of the hotel." },
      { url: "https://suvrettahouse.ch/en/suvretta-spa/suvretta-club-membership", title: "Suvretta Spa Club Membership (official)", fact: "Members' summer court use." },
    ],
  },
  {
    key: "karuizawa-west",
    venue: {
      destination: "japan", name: "Karuizawa Prince Hotel West", slug: "karuizawa-prince-hotel-west", venue_type: "resort", setting: "mountain",
      experiences: ["mountain"], city: "Karuizawa",
      summary: "A forest resort in Nagano's highland town of Karuizawa with artificial turf courts.",
      description:
        "Karuizawa has been a summer retreat for generations. The Prince Hotel West's facilities pages describe artificial turf courts, some lit for night play, shared across the East and West hotels.",
      website: "https://www.princehotels.com/karuizawa-west/", latitude: 36.34, longitude: 138.63, coordinates_approximate: true,
      access_type: "unknown", accommodation_available: true, scene: "zen", featured: true,
      extraNote: "Official pages give a combined figure for the East and West hotels; the West-only count is not confirmed.",
    },
    courts: [{ court_name: "Tennis courts", surface: "artificial_grass", indoor_outdoor: "outdoor", verification_status: "public_sources", booking_requirements: "Reported: fee applies; rental equipment available; reception at the hot-spring building." }],
    sources: [
      { url: "https://www.princehotels.com/karuizawa-west/facilities/tennis-courts/", title: "Tennis courts — Karuizawa Prince Hotel West (official)", fact: "Artificial turf courts; some lit." },
      { url: "https://www.princehotels.com/karuizawa-west/facilities/", title: "Facilities — Karuizawa Prince Hotel West (official)" },
    ],
  },
  {
    key: "halekulani-okinawa",
    venue: {
      destination: "japan", name: "Halekulani Okinawa", slug: "halekulani-okinawa", venue_type: "resort", setting: "beach",
      experiences: ["ocean", "luxury"], city: "Onna Village",
      summary: "A coastal resort in Onna, Okinawa, offering hourly court hire with racket and shoe rental.",
      description:
        "Halekulani Okinawa's tennis page lists hourly court hire including rental rackets and shoes, with advance reservation required.",
      website: "https://www.okinawa.halekulani.com/en/", latitude: 26.5, longitude: 127.85, coordinates_approximate: true,
      access_type: "unknown", accommodation_available: true, scene: "ocean", featured: false,
      extraNote: "Court count differs between booking sites and official pages.",
    },
    courts: [{ court_name: "Tennis court", verification_status: "public_sources", booking_requirements: "Reported: reserve at least one hour ahead; rental racket and shoes included in hourly fee." }],
    sources: [
      { url: "https://www.okinawa.halekulani.com/en/activity/4/", title: "Tennis — Halekulani Okinawa (official)", fact: "Hourly court hire with rentals; reported hours 10 AM–7 PM." },
    ],
  },
];

export const venueId = (key: string) => sid(`venue:${key}`);

export const venues: Venue[] = seeds.map(({ key, venue }) => {
  const { destination, extraNote, address, ...rest } = venue;
  return {
    id: venueId(key),
    destination_id: destinationId(destination),
    address: address ?? null,
    booking_url: null,
    phone: null,
    email: null,
    cover_image: null,
    cover_alt: null,
    verification_status: "public_sources",
    verification_notes: extraNote ? `${NOTE} ${extraNote}` : NOTE,
    last_verified_at: null,
    published: true,
    ...rest,
    ...ts,
  };
});

export const courts: Court[] = seeds.flatMap(({ key, courts }) =>
  courts.map((c, i) => ({
    id: sid(`court:${key}:${i}`),
    venue_id: venueId(key),
    surface: null, indoor_outdoor: null, covered: null, lighting: null, court_count: null,
    rental_price: null, rental_currency: null, booking_requirements: null, verification_status: "unverified" as const,
    ...c,
    ...ts,
  })),
);

export const facilities: Facility[] = seeds.flatMap(({ key, facilities = [] }) =>
  facilities.map((f, i) => ({ id: sid(`facility:${key}:${i}`), venue_id: venueId(key), description: null, verification_status: "public_sources" as const, ...f, ...ts })),
);

export const venueSources: VenueSource[] = seeds.flatMap(({ key, sources }) =>
  sources.map((s, i) => ({ id: sid(`source:${key}:${i}`), venue_id: venueId(key), url: s.url, title: s.title, fact: s.fact ?? null, accessed_at: RESEARCH_DATE, ...ts })),
);

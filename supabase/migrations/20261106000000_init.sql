-- ════════════════════════════════════════════════════════════════════
-- COURTSCAPE — initial schema
-- Mirrors src/lib/data/schema.ts. Target: Supabase Postgres 15+.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Helpers ──────────────────────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Admin allowlist for Row Level Security (defence in depth for direct API access).
create table if not exists public.admin_users (
  user_id uuid primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- Shared value domains (CHECK constraints keep values aligned with the app).
-- verification: personally_reviewed | venue_verified | public_sources | community_submitted | unverified

-- ── Destinations ─────────────────────────────────────────────────────
create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  country text not null,
  country_code char(2),
  region text,
  city text,
  tagline text,
  description text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  cover_image text,
  cover_alt text,
  scene text not null default 'ocean',
  experiences text[] not null default '{}',
  featured boolean not null default false,
  sort_order integer not null default 100,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index destinations_published_idx on public.destinations (published, sort_order);
create index destinations_country_idx on public.destinations (country);

-- ── Venues ───────────────────────────────────────────────────────────
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete set null,
  name text not null check (length(name) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  venue_type text not null default 'resort' check (venue_type in ('resort','hotel','club','academy','public')),
  setting text check (setting in ('mountain','beach','jungle','city','countryside','island')),
  experiences text[] not null default '{}',
  summary text,
  description text,
  address text,
  city text,
  website text,
  booking_url text,
  phone text,
  email text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  coordinates_approximate boolean not null default true,
  access_type text not null default 'unknown' check (access_type in ('guests_only','public','members','day_pass','on_request','unknown')),
  accommodation_available boolean,
  verification_status text not null default 'unverified'
    check (verification_status in ('personally_reviewed','venue_verified','public_sources','community_submitted','unverified')),
  verification_notes text,
  last_verified_at date,
  cover_image text,
  cover_alt text,
  scene text not null default 'ocean',
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index venues_destination_idx on public.venues (destination_id);
create index venues_published_featured_idx on public.venues (published, featured);
create index venues_verification_idx on public.venues (verification_status, last_verified_at);
create index venues_experiences_idx on public.venues using gin (experiences);

-- ── Courts ───────────────────────────────────────────────────────────
create table public.courts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  court_name text not null,
  surface text check (surface in ('hard','clay','grass','artificial_grass','carpet','other')),
  indoor_outdoor text check (indoor_outdoor in ('indoor','outdoor','both')),
  covered boolean,
  lighting boolean,
  court_count integer check (court_count between 1 and 100),
  rental_price numeric(12,2) check (rental_price >= 0),
  rental_currency char(3),
  booking_requirements text,
  verification_status text not null default 'unverified'
    check (verification_status in ('personally_reviewed','venue_verified','public_sources','community_submitted','unverified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A price is meaningless without its currency.
  constraint courts_price_currency check (rental_price is null or rental_currency is not null)
);
create index courts_venue_idx on public.courts (venue_id);
create index courts_surface_idx on public.courts (surface);

-- ── Facilities ───────────────────────────────────────────────────────
create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  category text not null default 'other' check (category in ('tennis','wellness','dining','family','fitness','other')),
  name text not null,
  description text,
  verification_status text not null default 'unverified'
    check (verification_status in ('personally_reviewed','venue_verified','public_sources','community_submitted','unverified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index facilities_venue_idx on public.facilities (venue_id);

-- ── Reviews (Tennis Escape Score) ────────────────────────────────────
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  reviewer text not null,
  scenery_score numeric(3,1) check (scenery_score between 1 and 10),
  tennis_quality_score numeric(3,1) check (tennis_quality_score between 1 and 10),
  stay_experience_score numeric(3,1) check (stay_experience_score between 1 and 10),
  accessibility_score numeric(3,1) check (accessibility_score between 1 and 10),
  family_experience_score numeric(3,1) check (family_experience_score between 1 and 10),
  -- Computed only when all five categories exist. Never entered by hand.
  overall_score numeric(3,1) generated always as (
    case when scenery_score is not null and tennis_quality_score is not null and stay_experience_score is not null
          and accessibility_score is not null and family_experience_score is not null
    then round((scenery_score + tennis_quality_score + stay_experience_score + accessibility_score + family_experience_score) / 5.0, 1)
    end
  ) stored,
  review_date date,
  review_notes text,
  personally_visited boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Scores may only be recorded for a personal visit.
  constraint reviews_scores_require_visit check (
    personally_visited or (scenery_score is null and tennis_quality_score is null and stay_experience_score is null
                           and accessibility_score is null and family_experience_score is null)
  )
);
create index reviews_venue_idx on public.reviews (venue_id, published, review_date desc);

-- ── Sources & photos ─────────────────────────────────────────────────
create table public.venue_sources (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  url text not null check (url ~* '^https?://'),
  title text,
  fact text,
  accessed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index venue_sources_venue_idx on public.venue_sources (venue_id);

create table public.venue_images (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  url text not null check (url ~* '^https?://'),
  alt text not null,
  credit text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index venue_images_venue_idx on public.venue_images (venue_id, sort_order);

-- ── Journal ──────────────────────────────────────────────────────────
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text,
  body text not null default '',
  cover_image text,
  cover_alt text,
  scene text not null default 'ocean',
  author text not null default 'COURTSCAPE Editors',
  category text not null default 'Field Notes',
  tags text[] not null default '{}',
  related_destination_id uuid references public.destinations(id) on delete set null,
  related_venue_id uuid references public.venues(id) on delete set null,
  published_at date,
  seo_title text check (length(seo_title) <= 70),
  seo_description text check (length(seo_description) <= 170),
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index articles_published_idx on public.articles (published, published_at desc);
create index articles_category_idx on public.articles (category);

-- ── Films ────────────────────────────────────────────────────────────
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  youtube_video_id text check (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  thumbnail text,
  scene text not null default 'ocean',
  category text not null default 'Court Portrait',
  related_venue_id uuid references public.venues(id) on delete set null,
  related_article_id uuid references public.articles(id) on delete set null,
  description text,
  duration text,
  published_at date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index videos_published_idx on public.videos (published, published_at desc);

-- ── Guides & purchases ───────────────────────────────────────────────
create table public.guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  subtitle text,
  description text,
  contents text[] not null default '{}',
  includes text[] not null default '{}',
  page_count integer check (page_count > 0),
  format text not null default 'PDF',
  price numeric(10,2) not null check (price >= 0),
  currency char(3) not null default 'USD',
  cover_image text,
  scene text not null default 'ocean',
  related_destination_id uuid references public.destinations(id) on delete set null,
  downloadable_file text,           -- private storage key; never exposed publicly
  status_note text,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index guides_published_idx on public.guides (published, featured);

create table public.guide_purchases (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guides(id) on delete restrict,
  customer_email text not null check (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  provider text not null,
  payment_reference text not null unique,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded','test')),
  amount numeric(10,2) not null check (amount >= 0),
  currency char(3) not null,
  purchase_date timestamptz,
  download_token_hash text unique,  -- SHA-256 of the buyer's token; the raw token is never stored
  download_count integer not null default 0 check (download_count >= 0),
  download_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index guide_purchases_guide_idx on public.guide_purchases (guide_id);
create index guide_purchases_email_idx on public.guide_purchases (lower(customer_email));
create index guide_purchases_status_idx on public.guide_purchases (payment_status, created_at desc);

-- ── Audience ─────────────────────────────────────────────────────────
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null default 'General',
  message text not null check (length(message) between 10 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiries_created_idx on public.inquiries (created_at desc);

-- ── updated_at triggers ─────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['destinations','venues','courts','facilities','reviews','venue_sources','venue_images',
                           'articles','videos','guides','guide_purchases','subscribers','inquiries']
  loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_updated_at', t);
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════
-- Row Level Security
-- The Next.js server connects with a privileged server-only credential (DATABASE_URL),
-- and authorises every admin action in application code. RLS below protects the
-- Supabase REST/GraphQL APIs exposed via the public anon key.
-- ════════════════════════════════════════════════════════════════════
alter table public.admin_users enable row level security;
alter table public.destinations enable row level security;
alter table public.venues enable row level security;
alter table public.courts enable row level security;
alter table public.facilities enable row level security;
alter table public.reviews enable row level security;
alter table public.venue_sources enable row level security;
alter table public.venue_images enable row level security;
alter table public.articles enable row level security;
alter table public.videos enable row level security;
alter table public.guides enable row level security;
alter table public.guide_purchases enable row level security;
alter table public.subscribers enable row level security;
alter table public.inquiries enable row level security;

-- Public read of published content
create policy "public read published destinations" on public.destinations for select to anon, authenticated using (published);
create policy "public read published venues" on public.venues for select to anon, authenticated using (published);
create policy "public read courts of published venues" on public.courts for select to anon, authenticated
  using (exists (select 1 from public.venues v where v.id = venue_id and v.published));
create policy "public read facilities of published venues" on public.facilities for select to anon, authenticated
  using (exists (select 1 from public.venues v where v.id = venue_id and v.published));
create policy "public read published reviews" on public.reviews for select to anon, authenticated
  using (published and exists (select 1 from public.venues v where v.id = venue_id and v.published));
create policy "public read sources of published venues" on public.venue_sources for select to anon, authenticated
  using (exists (select 1 from public.venues v where v.id = venue_id and v.published));
create policy "public read images of published venues" on public.venue_images for select to anon, authenticated
  using (exists (select 1 from public.venues v where v.id = venue_id and v.published));
create policy "public read published articles" on public.articles for select to anon, authenticated using (published);
create policy "public read published videos" on public.videos for select to anon, authenticated using (published);
create policy "public read published guides" on public.guides for select to anon, authenticated using (published);

-- The private file key must never be readable through the public API.
revoke select on public.guides from anon, authenticated;
grant select (id, title, slug, subtitle, description, contents, includes, page_count, format, price, currency,
              cover_image, scene, related_destination_id, status_note, published, featured, created_at, updated_at)
  on public.guides to anon, authenticated;

-- Admin full access (when signed in via Supabase Auth and listed in admin_users)
do $$
declare t text;
begin
  foreach t in array array['destinations','venues','courts','facilities','reviews','venue_sources','venue_images',
                           'articles','videos','guides','guide_purchases','subscribers','inquiries']
  loop
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', 'admin all ' || t, t);
  end loop;
end $$;
create policy "admins read admin_users" on public.admin_users for select to authenticated using (public.is_admin());

-- guide_purchases, subscribers and inquiries have NO public policies: purchases are
-- created and settled only server-side after payment verification.

-- ════════════════════════════════════════════════════════════════════
-- Storage buckets (Supabase)
-- ════════════════════════════════════════════════════════════════════
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
    insert into storage.buckets (id, name, public) values ('guides-private', 'guides-private', false) on conflict (id) do nothing;
  end if;
end $$;
-- Private guide files are only reachable through short-lived signed URLs created
-- server-side with the service role key. No storage policies grant anon access to them.

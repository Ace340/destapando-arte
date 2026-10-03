-- ============================================================
-- Destapando el Arte — foundation schema (ADR-0005 dual track)
-- Every table maps to a term in GLOSSARY.md.
-- Every constraint maps to an ADR in docs/adr/.
-- The database is the last line of defense against canon drift:
-- if the ADRs say it, the schema enforces it.
-- ============================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---------- Enums (the language, as values) ----------

create type story_status as enum ('created', 'enriched', 'draft', 'published');                        -- ADR-0005
create type rights_status as enum ('clear', 'blocked');                                               -- ADR-0002 / 0003
create type curiosity_type as enum ('fact', 'myth', 'legend');                                        -- ADR-0007 (mito destapado = 'myth')
create type requested_via as enum ('channel', 'artist_page', 'web_form', 'search_miss', 'story_page'); -- ADR-0001 ('scanner_miss' joins at Phase 3)
create type evidence_visual as enum ('our_diagram', 'youtube_embed', 'both', 'none');                 -- ADR-0014
create type image_kind as enum ('display', 'reference');                                              -- ADR-0012 rider

-- ---------- Reference tables ----------

create table artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  why_special text,                -- the one editorial paragraph (GLOSSARY: Why_special, ADR-0010)
  episode_youtube_id text,         -- nullable: some episodes are about an artist, not a work
  born_year int,
  died_year int,
  wikidata_id text,                -- filled by import; never fabricated by hand
  created_at timestamptz not null default now()
);

create table movements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null               -- pure taxonomy in v1 (ADR-0010): no editorial surface
);

create table artist_movements (
  artist_id uuid not null references artists(id) on delete cascade,
  movement_id uuid not null references movements(id) on delete cascade,
  primary key (artist_id, movement_id)
);

create table films (               -- GLOSSARY: Film — reusable cinema entity
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year int,
  director text,
  created_at timestamptz not null default now(),
  unique (title, year, director)
);

-- ---------- The Catalog ----------

create table artworks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_es text not null,
  artist_id uuid references artists(id),
  year text,                            -- text: '1656', '1888–1889' — paintings have ranges
  rights_status rights_status not null default 'clear',  -- verified at enriched (ADR-0002)
  story_status story_status not null default 'created',
  indexed boolean not null default false,                -- ADR-0005: independent track, not a pipeline fork
  summary text,                          -- beat 1: qué es
  why_it_matters text,                   -- beat 2: the mandatory 2–3 sentence argument
  essay text,                            -- the single escape hatch (GLOSSARY: Essay)
  palette jsonb not null default '[]',   -- hex accents; powers obra del día design
  source_transcript text,                -- ADR-0013: lands at created, or no adapted discount
  episode_youtube_id text,               -- 1 artwork = 1 Short in v1 (junction table at v1.1)
  wikidata_id text,
  met_object_id int,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table physical_instances (        -- ADR-0004: versions collapse here; never recognition targets
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references artworks(id) on delete cascade,
  version_note text,                     -- e.g. 'pastel, 1893'
  location text,                         -- museum name; powers Modo Museo later
  city text,
  country text
);

create table image_assets (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references artworks(id) on delete cascade,
  kind image_kind not null,              -- 'reference' assets deliberately include poster-quality sources
  source_url text not null,              -- Commons file page
  credit text,
  created_at timestamptz not null default now()
);

create table curiosities (               -- ADR-0007: typed + sourced, ordered list
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references artworks(id) on delete cascade,
  position int not null,
  text text not null,
  type curiosity_type not null,
  source_url text not null,              -- mandatory: "I only write what I can defend"
  source_note text,
  unique (artwork_id, position)
);

create table film_connections (          -- GLOSSARY: the moat
  id uuid primary key default gen_random_uuid(),
  film_id uuid not null references films(id),
  artwork_id uuid references artworks(id),
  artist_id uuid references artists(id),
  movement_id uuid references movements(id),
  what_it_borrowed text not null,        -- framing? palette? light?
  mechanism text not null,               -- the specific claim
  frame_analysis_text text not null,     -- ADR-0014: required; no claim rests on a link we don't control
  evidence_visual evidence_visual not null default 'none',
  evidence_url text,                     -- embed URL: garnish, never load-bearing
  -- attaches to exactly one of artwork / artist / movement
  constraint one_target check (
    (artwork_id is not null)::int + (artist_id is not null)::int + (movement_id is not null)::int = 1
  )
);

create table colecciones (               -- GLOSSARY: Colección — hand-curated only ('Mitos destapados' is an app-side view)
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  blurb text,                            -- the voice paragraph
  created_at timestamptz not null default now()
);

create table coleccion_members (
  coleccion_id uuid not null references colecciones(id) on delete cascade,
  artwork_id uuid not null references artworks(id) on delete cascade,
  position int not null,
  primary key (coleccion_id, artwork_id)
);

-- ---------- Demand & telemetry ----------

create table content_requests (          -- ADR-0001 / 0018: Avísame queue + demand signals
  id uuid primary key default gen_random_uuid(),
  requested_via requested_via not null,
  label text not null,                   -- what was asked: 'Las Meninas', 'Dalí', an empty search term
  artwork_id uuid references artworks(id),  -- resolves once identified & cataloged
  artist_id uuid references artists(id),
  push_token text,                       -- Expo token; anonymous, no accounts
  notified_at timestamptz,               -- set by the daily digest flush (ADR-0018)
  created_at timestamptz not null default now()
);

create table analytics_events (          -- ADR-0016: attribution, cheap and honest
  id uuid primary key default gen_random_uuid(),
  event_type text not null,              -- 'episode_tap', ...
  artwork_id uuid references artworks(id),
  episode_youtube_id text,
  props jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------- ADR enforcement: the rule lives in the sender, not in hope ----------

-- ADR-0005: scannable = published AND indexed AND >= 3 diverse references
-- (floor 3 is hard; target 7 is dashboard guidance, not DB business)
create function enforce_indexing_gate() returns trigger as $$
declare
  ref_count int;
begin
  if new.indexed then
    if new.story_status <> 'published' then
      raise exception 'ADR-0005: indexed requires story_status = published (scannable = published AND indexed)';
    end if;
    if new.rights_status = 'blocked' then
      raise exception 'ADR-0003: rights-blocked works can never index (story-only lesson)';
    end if;
    select count(*) into ref_count from image_assets where artwork_id = new.id and kind = 'reference';
    if ref_count < 3 then
      raise exception 'ADR-0005: indexing gate requires >= 3 reference image assets (found %)', ref_count;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger artworks_indexing_gate
  before update on artworks
  for each row
  when (new.indexed)
  execute function enforce_indexing_gate();

-- ADR-0012 rider: story-only works skip reference gathering entirely
create function enforce_story_only() returns trigger as $$
begin
  if new.kind = 'reference' and exists (
    select 1 from artworks a where a.id = new.artwork_id and a.rights_status = 'blocked'
  ) then
    raise exception 'ADR-0012: rights-blocked artworks take no reference image assets (story-only lesson)';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger image_assets_story_only
  before insert on image_assets
  for each row
  execute function enforce_story_only();

create function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger artworks_touch
  before update on artworks
  for each row
  execute function touch_updated_at();

-- ---------- RLS: public pages read published truth; writes go server-side ----------
-- Phase 1 has no auth (ADR-0012). Dashboard writes run through the server-only
-- secret key (bypasses RLS). Anon/publishable-key reads are denied by default
-- except the policies below. Tighten before closed beta (ADR-0017).

alter table artworks enable row level security;
alter table artists enable row level security;
alter table movements enable row level security;
alter table artist_movements enable row level security;
alter table films enable row level security;
alter table physical_instances enable row level security;
alter table image_assets enable row level security;
alter table curiosities enable row level security;
alter table film_connections enable row level security;
alter table colecciones enable row level security;
alter table coleccion_members enable row level security;
alter table content_requests enable row level security;
alter table analytics_events enable row level security;

-- Public read: the live Catalog (public Story pages, ADR-0011)
create policy "public reads published artworks" on artworks
  for select to anon, authenticated
  using (story_status = 'published');

-- Reference data is public knowledge
create policy "public reads artists" on artists
  for select to anon, authenticated using (true);
create policy "public reads movements" on movements
  for select to anon, authenticated using (true);
create policy "public reads artist_movements" on artist_movements
  for select to anon, authenticated using (true);
create policy "public reads films" on films
  for select to anon, authenticated using (true);
create policy "public reads colecciones" on colecciones
  for select to anon, authenticated using (true);
create policy "public reads coleccion_members" on coleccion_members
  for select to anon, authenticated using (true);

-- Editorial children: readable only through a published parent
create policy "public reads curiosities of published" on curiosities
  for select to anon, authenticated
  using (exists (select 1 from artworks a where a.id = curiosities.artwork_id and a.story_status = 'published'));

create policy "public reads connections of published artworks" on film_connections
  for select to anon, authenticated
  using (artwork_id is not null and exists (
    select 1 from artworks a where a.id = film_connections.artwork_id and a.story_status = 'published'));

-- Artist/movement connections are language-level claims: public once written
create policy "public reads artist connections" on film_connections
  for select to anon, authenticated using (artist_id is not null);
create policy "public reads movement connections" on film_connections
  for select to anon, authenticated using (movement_id is not null);

create policy "public reads instances of published" on physical_instances
  for select to anon, authenticated
  using (exists (select 1 from artworks a where a.id = physical_instances.artwork_id and a.story_status = 'published'));

create policy "public reads assets of published" on image_assets
  for select to anon, authenticated
  using (exists (select 1 from artworks a where a.id = image_assets.artwork_id and a.story_status = 'published'));

-- content_requests / analytics_events: deliberately NO anon policies.
-- Inserts arrive server-side via the secret key (public forms route through
-- server actions / route handlers — never direct client writes).

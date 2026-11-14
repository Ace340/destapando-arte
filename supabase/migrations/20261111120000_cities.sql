-- Cities (GLOSSARY: Ciudad; ADR-0024): hand-created editorial entities.
-- Creation is the listing gate — no draft state, no derived threshold.
-- Mobile-only surface in v1; no /ciudad/{slug} web page yet (ADR-0024).
create table cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,                    -- Spanish display name (ADR-0009)
  position int not null,                 -- hand order in the Ciudades tab
  created_at timestamptz not null default now()
);

-- City places (GLOSSARY: Lugar; ADR-0024): hand-curated museums/galleries,
-- the important ones, not exhaustive — may hold no catalog obra.
-- Deliberately NOT a museum entity: Modo Museo's future schema stays free (ADR-0024).
create table city_places (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  name text not null,
  note text,
  url text,                              -- optional; seed ships NULL (ADR-0014: no unverified links)
  position int not null,
  unique (city_id, position),
  created_at timestamptz not null default now()
);

alter table cities enable row level security;
alter table city_places enable row level security;

-- Creation = listing (ADR-0024): every row is public. Writes go through the
-- Tablero server actions (secret key, bypasses RLS) — no anon write policies,
-- same stance as every other table.
create policy "public reads cities" on cities
  for select using (true);

create policy "public reads city places" on city_places
  for select using (true);

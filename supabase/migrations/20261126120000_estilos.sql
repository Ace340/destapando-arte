-- ============================================================
-- ADR-0025: Estilos replace Movements; obras carry a style
--
-- The glossary-termed Movement renames to Estilo — «Estilos» to users,
-- style in code (the users' words for what the chips are; "genre" and
-- "movement" both name the wrong thing in art history). The renames are
-- full: movements -> styles, artist_movements -> artist_styles, and
-- film_connections.movement_id -> style_id, so the schema keeps reading
-- the canon it enforces (init header: every table maps to a GLOSSARY.md
-- term).
--
-- Alongside the rename, the per-obra classification: artworks gains a
-- nullable style_id (null = unclassified). The artist keeps their
-- many-to-many; a work claims ONE style — the dominant one, or nothing
-- until the Tablero sets it. Artist-derived classification was rejected
-- in the ADR: an artist's spans-of-career styles are not each obra's.
-- ============================================================

alter table movements rename to styles;
alter table artist_movements rename to artist_styles;

-- Constraint names follow the terms, not the history they arrived with
alter table styles rename constraint movements_pkey to styles_pkey;
alter table artist_styles rename constraint artist_movements_pkey to artist_styles_pkey;
alter table artist_styles
  rename constraint artist_movements_artist_id_fkey to artist_styles_artist_id_fkey;
alter table artist_styles
  rename constraint artist_movements_movement_id_fkey to artist_styles_style_id_fkey;
alter table film_connections rename column movement_id to style_id;
alter table film_connections
  rename constraint film_connections_movement_id_fkey to film_connections_style_id_fkey;

-- Policy names too: they are part of the sentence the schema reads
alter policy "public reads movements" on styles rename to "public reads styles";
alter policy "public reads artist_movements" on artist_styles
  rename to "public reads artist_styles";
alter policy "public reads movement connections" on film_connections
  rename to "public reads style connections";

-- The per-obra link (ADR-0025). Null until the Tablero's Estilo dropdown
-- classifies the work; the «Sin clasificar» strip chip reads these rows
-- during dev and retires at full coverage.
alter table artworks add column style_id uuid references styles(id);
create index artworks_style_id_idx on artworks (style_id);

-- Import provenance, same rule as artists/artworks: filled by import,
-- never fabricated by hand.
alter table styles add column wikidata_id text;

-- Placeholder taxonomy (grilling session 2026-11-26): Spanish names, the
-- slugs the strip links by, wikidata ids left NULL until a real import
-- pass fills them.
insert into styles (slug, name) values
  ('impresionismo', 'Impresionismo'),
  ('postimpresionismo', 'Postimpresionismo'),
  ('realismo', 'Realismo'),
  ('cubismo', 'Cubismo'),
  ('surrealismo', 'Surrealismo'),
  ('expresionismo', 'Expresionismo'),
  ('arte-abstracto', 'Arte abstracto'),
  ('barroco', 'Barroco'),
  ('renacimiento', 'Renacimiento');

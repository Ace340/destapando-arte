-- ============================================================
-- Seed: the 10-painting slice (ADR-0006), created state, slugs reserved.
-- wikidata_id / met_object_id are intentionally NULL: the import script
-- fills them — we never fabricate identifiers by hand.
-- PLACEHOLDER picks are marked: Caravaggio/Vermeer candidates await
-- Patrick's editorial confirmation (dashboard swap is cheap; ADR-0006).
-- ============================================================

insert into artists (slug, name) values
  ('vincent-van-gogh', 'Vincent van Gogh'),
  ('diego-velazquez', 'Diego Velázquez'),
  ('johannes-vermeer', 'Johannes Vermeer'),
  ('michelangelo-merisi-da-caravaggio', 'Caravaggio (Michelangelo Merisi)'),
  ('frida-kahlo', 'Frida Kahlo')
on conflict (slug) do nothing;

insert into artworks (slug, title_es, artist_id, year) values
  ('noche-estrellada', 'La noche estrellada',
    (select id from artists where slug = 'vincent-van-gogh'), '1889'),
  ('girasoles', 'Girasoles',
    (select id from artists where slug = 'vincent-van-gogh'), '1888'),
  ('la-habitacion-de-arles', 'La habitación en Arles',
    (select id from artists where slug = 'vincent-van-gogh'), '1888'),
  ('autorretrato-van-gogh', 'Autorretrato',
    (select id from artists where slug = 'vincent-van-gogh'), '1889'),
  ('las-meninas', 'Las Meninas',
    (select id from artists where slug = 'diego-velazquez'), '1656'),
  -- PLACEHOLDER picks (editorial confirmation pending):
  ('la-vocacion-de-san-mateo', 'La vocación de san Mateo',
    (select id from artists where slug = 'michelangelo-merisi-da-caravaggio'), '1599–1600'),
  ('canasta-de-frutas', 'Canasta de frutas',
    (select id from artists where slug = 'michelangelo-merisi-da-caravaggio'), 'c. 1596'),
  ('la-lechera', 'La lechera',
    (select id from artists where slug = 'johannes-vermeer'), 'c. 1658'),
  ('chica-con-arete-de-perla', 'Chica con arete de perla',
    (select id from artists where slug = 'johannes-vermeer'), 'c. 1665'),
  -- Frida: public domain from 2025 (d. 1954, life+70); confirm at enriched (ADR-0002)
  ('las-dos-fridas', 'Las dos Fridas',
    (select id from artists where slug = 'frida-kahlo'), '1939')
on conflict (slug) do nothing;

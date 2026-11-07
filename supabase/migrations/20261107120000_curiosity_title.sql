-- Curiosity titles: an optional editorial headline per curiosity.
-- The public surfaces (web /obra, mobile Historia) render `title` as the
-- collapsed row label; NULL falls back to the text preview, so untitled
-- rows keep working until the editor adds a title (setCuriosityTitle).
-- Backfill: the ten mitos destapados (ADR-0007 premium tier) get titles
-- here, drafted from docs/stories/*.md; facts and leyendas stay untitled.

alter table curiosities add column title text;

-- autorretrato-van-gogh (myth): the "face of a madman" debunked by carta 800
update curiosities set title = 'La cara de un loco'
where artwork_id = (select id from artworks where slug = 'autorretrato-van-gogh')
  and position = 1 and title is null;

-- noche-estrellada (myth): painted by day, in the studio — not at night from the window
update curiosities set title = 'La noche pintada de día'
where artwork_id = (select id from artworks where slug = 'noche-estrellada')
  and type = 'myth' and title is null;

-- las-meninas (myth): not the infanta's portrait — the name is the myth
update curiosities set title = 'Ni retrato de la infanta'
where artwork_id = (select id from artworks where slug = 'las-meninas')
  and type = 'myth' and title is null;

-- las-dos-fridas (myth): «surrealista» was Breton''s label, not hers
update curiosities set title = 'Frida no era surrealista'
where artwork_id = (select id from artworks where slug = 'las-dos-fridas')
  and type = 'myth' and title is null;

-- la-vocacion-de-san-mateo (myth): the Church never rejected it — it was a triumph
update curiosities set title = 'El escándalo que nunca fue'
where artwork_id = (select id from artworks where slug = 'la-vocacion-de-san-mateo')
  and type = 'myth' and title is null;

-- la-lechera (myth): camera obscura is a debate, not a fact — the pinhole and the chalk string
update curiosities set title = 'El agujero de alfiler'
where artwork_id = (select id from artworks where slug = 'la-lechera')
  and type = 'myth' and title is null;

-- la-habitacion-de-arles (myth): painted before the crisis — «la revancha del descanso forzado»
update curiosities set title = 'La revancha del descanso'
where artwork_id = (select id from artworks where slug = 'la-habitacion-de-arles')
  and type = 'myth' and title is null;

-- girasoles (myth): Gauguin''s scene of Vincent painting sunflowers was imagined
update curiosities set title = 'La escena que nunca ocurrió'
where artwork_id = (select id from artworks where slug = 'girasoles')
  and type = 'myth' and title is null;

-- chica-con-arete-de-perla (myth): not a portrait, not the daughter — a tronie
update curiosities set title = 'No es un retrato'
where artwork_id = (select id from artworks where slug = 'chica-con-arete-de-perla')
  and type = 'myth' and title is null;

-- canasta-de-frutas (myth): the "minor trifle" that founded a genre
update curiosities set title = 'La bagatela que fundó un género'
where artwork_id = (select id from artworks where slug = 'canasta-de-frutas')
  and type = 'myth' and title is null;

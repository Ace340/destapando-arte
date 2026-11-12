-- Ciudades carga (ADR-0024): the two launch placeholder cities.
-- Idempotent: not-exists guards per city slug and per (city_id, place name).
-- place url ships NULL — added later via the Tablero editor, only when
-- verified live (ADR-0014: no claim rests on a link we don't control).
--
-- Load (NEVER pipe UTF-8 SQL through PowerShell — CANON ops lesson):
--   docker cp supabase/story-loads/ciudades.sql <db-container>:/tmp/ciudades.sql
--   docker exec <db-container> psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/ciudades.sql

insert into cities (slug, name, position)
select 'nueva-york', 'Nueva York', 1
where not exists (select 1 from cities where slug = 'nueva-york');

insert into cities (slug, name, position)
select 'ciudad-de-mexico', 'Ciudad de México', 2
where not exists (select 1 from cities where slug = 'ciudad-de-mexico');

-- Nueva York — the catalog obra here: La noche estrellada @ MoMA
insert into city_places (city_id, name, note, url, position)
select c.id, p.name, p.note, null, p.position
from cities c
join (
  values
    ('Museum of Modern Art (MoMA)', 'Aquí cuelga La noche estrellada, del catálogo.', 1),
    ('The Metropolitan Museum of Art', 'El Met: cinco mil años de arte, de Velázquez a Van Gogh.', 2),
    ('Solomon R. Guggenheim Museum', 'La rotonda de Frank Lloyd Wright, en Museum Mile.', 3),
    ('The Frick Collection', 'Mansión-museo del Upper East Side: Fragonard, Vermeer, Rembrandt.', 4)
) as p(name, note, position) on true
where c.slug = 'nueva-york'
  and not exists (
    select 1 from city_places cp
    where cp.city_id = c.id and cp.name = p.name
  );

-- Ciudad de México — the catalog obra here: Las dos Fridas @ MAM
insert into city_places (city_id, name, note, url, position)
select c.id, p.name, p.note, null, p.position
from cities c
join (
  values
    ('Museo de Arte Moderno (INBAL)', 'Aquí cuelgan Las dos Fridas, del catálogo. Bosque de Chapultepec.', 1),
    ('Museo Frida Kahlo (Casa Azul)', 'La casa azul de Coyoacán donde nació y murió Frida.', 2),
    ('Museo Nacional de Arte (Munal)', 'Arte mexicano del virreinato al modernismo, junto al Zócalo.', 3),
    ('Palacio de Bellas Artes', 'Murales de Rivera, Siqueiros y Orozco; teatro y museo a la vez.', 4)
) as p(name, note, position) on true
where c.slug = 'ciudad-de-mexico'
  and not exists (
    select 1 from city_places cp
    where cp.city_id = c.id and cp.name = p.name
  );

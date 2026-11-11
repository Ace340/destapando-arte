-- Curiosity titles, tier two: every curiosity gets an editorial headline.
-- Tier one (20261107120000) titled the ten mitos destapados; facts and
-- leyendas stayed untitled pending editorial review. This backfill completes
-- the set — headlines drafted from docs/stories/*.md — and retitles the
-- chica-con-arete myth per editorial decision: the painting's nickname is
-- the hook («La Mona Lisa del Norte»).
-- Guards: `title is null` keeps the backfill idempotent and never clobbers
-- editor changes (setCuriosityTitle); the myth replacement matches the exact
-- previous value instead. Story-loads carry the same titles in the same
-- commit (no-drift contract).

-- chica-con-arete-de-perla (myth): retitle — the nickname is the hook
update curiosities set title = 'La Mona Lisa del Norte'
where artwork_id = (select id from artworks where slug = 'chica-con-arete-de-perla')
  and type = 'myth' and title = 'No es un retrato';

-- chica-con-arete-de-perla (fact): bought for 2,30 florines — the bargain of art history
update curiosities set title = 'La ganga más célebre'
where artwork_id = (select id from artworks where slug = 'chica-con-arete-de-perla')
  and position = 2 and type = 'fact' and title is null;

-- chica-con-arete-de-perla (fact): the dark ground is a fading green glaze, curtain folds behind
update curiosities set title = 'El fondo que fue verde'
where artwork_id = (select id from artworks where slug = 'chica-con-arete-de-perla')
  and position = 3 and type = 'fact' and title is null;

-- chica-con-arete-de-perla (fact): the pearl is probably a tin varnish trick
update curiosities set title = 'La perla que no es perla'
where artwork_id = (select id from artworks where slug = 'chica-con-arete-de-perla')
  and position = 4 and type = 'fact' and title is null;

-- chica-con-arete-de-perla (legend): her only name, Griet, was invented by a novelist
update curiosities set title = 'La chica sin nombre'
where artwork_id = (select id from artworks where slug = 'chica-con-arete-de-perla')
  and position = 5 and type = 'legend' and title is null;

-- autorretrato-van-gogh (fact): no money for models — he painted himself, ~32 times
update curiosities set title = 'Su propio modelo'
where artwork_id = (select id from artworks where slug = 'autorretrato-van-gogh')
  and position = 2 and type = 'fact' and title is null;

-- autorretrato-van-gogh (fact): the last self-portrait, historians mostly agree
update curiosities set title = 'Probablemente el último'
where artwork_id = (select id from artworks where slug = 'autorretrato-van-gogh')
  and position = 3 and type = 'fact' and title is null;

-- autorretrato-van-gogh (fact): Gachet loved it; his children donated it to France
update curiosities set title = 'La cara del paciente'
where artwork_id = (select id from artworks where slug = 'autorretrato-van-gogh')
  and position = 4 and type = 'fact' and title is null;

-- autorretrato-van-gogh (legend): the swirling background read as the map of his mind
update curiosities set title = 'El mapa de su mente'
where artwork_id = (select id from artworks where slug = 'autorretrato-van-gogh')
  and position = 5 and type = 'legend' and title is null;

-- noche-estrellada (fact): the brightest "star" is Venus, per carta 777 + astronomers
update curiosities set title = 'La estrella que era Venus'
where artwork_id = (select id from artworks where slug = 'noche-estrellada')
  and position = 2 and type = 'fact' and title is null;

-- noche-estrellada (fact): Vincent considered it a failure («otro fracaso»)
update curiosities set title = 'Otro fracaso'
where artwork_id = (select id from artworks where slug = 'noche-estrellada')
  and position = 3 and type = 'fact' and title is null;

-- noche-estrellada (fact): a crescent where the moon was waning gibbous
update curiosities set title = 'La luna equivocada'
where artwork_id = (select id from artworks where slug = 'noche-estrellada')
  and position = 4 and type = 'fact' and title is null;

-- noche-estrellada (legend): the cypress as the bridge from earth to the stars
update curiosities set title = 'El puente a la estrella'
where artwork_id = (select id from artworks where slug = 'noche-estrellada')
  and position = 5 and type = 'legend' and title is null;

-- las-meninas (fact): the mirror — where the viewer stands, the kings stood
update curiosities set title = 'El truco del espejo'
where artwork_id = (select id from artworks where slug = 'las-meninas')
  and position = 2 and type = 'fact' and title is null;

-- las-meninas (fact): X-rays: three sewn bands, no underdrawing, pentimenti, fire of 1734
update curiosities set title = 'Un cuadro cosido'
where artwork_id = (select id from artworks where slug = 'las-meninas')
  and position = 3 and type = 'fact' and title is null;

-- las-meninas (fact): Manet's verdict — «el pintor de los pintores» — and Picasso's 58
update curiosities set title = 'El pintor de los pintores'
where artwork_id = (select id from artworks where slug = 'las-meninas')
  and position = 4 and type = 'fact' and title is null;

-- las-meninas (legend): the Santiago cross, impossible in 1656 — the king may have painted it
update curiosities set title = 'La cruz que pintó el rey'
where artwork_id = (select id from artworks where slug = 'las-meninas')
  and position = 5 and type = 'legend' and title is null;

-- girasoles (fact): four versions in one week, racing the flowers' decay
update curiosities set title = 'Contra el reloj de la flor'
where artwork_id = (select id from artworks where slug = 'girasoles')
  and position = 2 and type = 'fact' and title is null;

-- girasoles (fact): seven canvases; the 1945 Ashiya bombing destroyed one
update curiosities set title = 'El que murió en la guerra'
where artwork_id = (select id from artworks where slug = 'girasoles')
  and position = 3 and type = 'fact' and title is null;

-- girasoles (fact): his priceless boast — «yo tengo el girasol», 500 francos
update curiosities set title = 'Yo tengo el girasol'
where artwork_id = (select id from artworks where slug = 'girasoles')
  and position = 4 and type = 'fact' and title is null;

-- girasoles (legend): 15 sunflowers, 15 ages — a vanitas that says gracias
update curiosities set title = 'Un ramo que agradece'
where artwork_id = (select id from artworks where slug = 'girasoles')
  and position = 5 and type = 'legend' and title is null;

-- la-lechera (fact): X-rays show what Vermeer removed — the painting wins by subtraction
update curiosities set title = 'El cuadro de las restas'
where artwork_id = (select id from artworks where slug = 'la-lechera')
  and position = 2 and type = 'fact' and title is null;

-- la-lechera (fact): the broken window pane, painted with its reflection — wear as realism
update curiosities set title = 'El cristal roto'
where artwork_id = (select id from artworks where slug = 'la-lechera')
  and position = 3 and type = 'fact' and title is null;

-- la-lechera (fact): from 175 florines (1696) to the Rijksmuseum's national effort (1908)
update curiosities set title = 'La criada que costó una casa'
where artwork_id = (select id from artworks where slug = 'la-lechera')
  and position = 4 and type = 'fact' and title is null;

-- la-lechera (legend): the foot warmer, the Cupido tile, melken — a love message?
update curiosities set title = 'El mensaje de amor'
where artwork_id = (select id from artworks where slug = 'la-lechera')
  and position = 5 and type = 'legend' and title is null;

-- la-habitacion-de-arles (fact): the letter's own inventory of colors, no shadows
update curiosities set title = 'El inventario de color'
where artwork_id = (select id from artworks where slug = 'la-habitacion-de-arles')
  and position = 2 and type = 'fact' and title is null;

-- la-habitacion-de-arles (fact): the room was trapezoidal — Ramser's plans survived 1944
update curiosities set title = 'El cuarto trapezoidal'
where artwork_id = (select id from artworks where slug = 'la-habitacion-de-arles')
  and position = 3 and type = 'fact' and title is null;

-- la-habitacion-de-arles (fact): the flood-damaged original, then three versions, three museums
update curiosities set title = 'Tres habitaciones, tres museos'
where artwork_id = (select id from artworks where slug = 'la-habitacion-de-arles')
  and position = 4 and type = 'fact' and title is null;

-- la-habitacion-de-arles (legend): the violet walls faded to blue — now only in letter and pixel
update curiosities set title = 'El violeta perdido'
where artwork_id = (select id from artworks where slug = 'la-habitacion-de-arles')
  and position = 5 and type = 'legend' and title is null;

-- las-dos-fridas (fact): anatomy class — two hearts, scissors, the vein as lifeline
update curiosities set title = 'La clase de anatomía'
where artwork_id = (select id from artworks where slug = 'las-dos-fridas')
  and position = 2 and type = 'fact' and title is null;

-- las-dos-fridas (fact): her first large-scale work, painted in the divorce year
update curiosities set title = 'El primer gran formato'
where artwork_id = (select id from artworks where slug = 'las-dos-fridas')
  and position = 3 and type = 'fact' and title is null;

-- las-dos-fridas (fact): INBA 1947 purchase — the founding stone of the MAM collection
update curiosities set title = 'La piedra fundacional'
where artwork_id = (select id from artworks where slug = 'las-dos-fridas')
  and position = 4 and type = 'fact' and title is null;

-- las-dos-fridas (legend): two bloods (German father / Mexican mother) vs the imaginary friend
update curiosities set title = 'Las dos sangres'
where artwork_id = (select id from artworks where slug = 'las-dos-fridas')
  and position = 5 and type = 'legend' and title is null;

-- la-vocacion-de-san-mateo (fact): Christ's hand is Michelangelo's Creation, inverted
update curiosities set title = 'La mano invertida'
where artwork_id = (select id from artworks where slug = 'la-vocacion-de-san-mateo')
  and position = 2 and type = 'fact' and title is null;

-- la-vocacion-de-san-mateo (fact): the Jubilee deadline and Del Monte's patronage
update curiosities set title = 'Contra el reloj del Jubileo'
where artwork_id = (select id from artworks where slug = 'la-vocacion-de-san-mateo')
  and position = 3 and type = 'fact' and title is null;

-- la-vocacion-de-san-mateo (fact): the painted beam matches the chapel's real light
update curiosities set title = 'La luz que era real'
where artwork_id = (select id from artworks where slug = 'la-vocacion-de-san-mateo')
  and position = 4 and type = 'fact' and title is null;

-- la-vocacion-de-san-mateo (legend): which man is Matthew — «¿yo?» or «¿él?»
update curiosities set title = '¿Yo o él?'
where artwork_id = (select id from artworks where slug = 'la-vocacion-de-san-mateo')
  and position = 5 and type = 'legend' and title is null;

-- canasta-de-frutas (fact): Purdue's horticultural diagnosis — every fruit sick, one quince spared
update curiosities set title = 'La fruta enferma'
where artwork_id = (select id from artworks where slug = 'canasta-de-frutas')
  and position = 2 and type = 'fact' and title is null;

-- canasta-de-frutas (fact): Borromeo's 1607 codicil — «quedó sola», nothing could stand beside it
update curiosities set title = 'Quedó sola'
where artwork_id = (select id from artworks where slug = 'canasta-de-frutas')
  and position = 3 and type = 'fact' and title is null;

-- canasta-de-frutas (fact): painted over a second-hand canvas of grotesques
update curiosities set title = 'Tela de segunda mano'
where artwork_id = (select id from artworks where slug = 'canasta-de-frutas')
  and position = 4 and type = 'fact' and title is null;

-- canasta-de-frutas (legend): the basket read as a memento mori — all that ripens, dies
update curiosities set title = 'Todo lo que madura, muere'
where artwork_id = (select id from artworks where slug = 'canasta-de-frutas')
  and position = 5 and type = 'legend' and title is null;

# Destapando el Arte

Spanish-first app + YouTube channel: one brand, two products. The app tells the story of an Artwork — what it is, why it matters, the myths, and the films that borrowed its language. A hand-written editorial layer over an open-data base (Met + Wikidata), owned from a dashboard. The Catalog is the recognition boundary; the garden grows visibly and users vote on what gets planted next.

## El Catálogo

**Artwork**:
The canonical creation, one record regardless of physical versions. The only thing recognition can ever target.
_Avoid_: painting, work, piece (as entity names)

**Physical instance**:
A specific version of an Artwork and where it lives. Powers Modo Museo and "see it in person." Never a recognition target.
_Avoid_: version, copy

**Image asset**:
A hosted file bound to an Artwork — display reproduction or recognition reference. Poster-quality sources are first-class, because posters are the primary scan surface.

**Catalog**:
The published, scannable set of Artworks with Stories. Coverage of the Catalog is coverage of the product.
_Avoid_: database, library

**Scannable**:
Published AND indexed: rights-cleared public-domain work with reference vectors in the recognition index.

**Story-only lesson**:
A published Story for a rights-blocked Artwork, taught without any scannable image. A permanent type, not a pipeline detour.
_Avoid_: Guernica-mode, workaround

**Indexed**:
Recognition-index membership, independent of editorial status. Gate: minimum 3 diverse references, target 7.

**Modo Museo**:
A pack binding Artworks, via physical instances, to specific museum walls (v1.1+).

## La Capa Editorial

**Story**:
The editorial unit for one Artwork: four fixed beats — summary, why_it_matters, curiosities, film connections — plus an optional essay escape hatch.
_Avoid_: article, entry, post

**Essay**:
The single free-form field per Story, for works the four beats don't fit.

**Curiosity**:
A typed, sourced editorial morsel: fact, mito destapado, or leyenda. Each carries one visible citation chip.

**Mito destapado**:
The debunk — the legend says X, the evidence says Y. The brand verb as a content tier; premium and shareable.

**Obra del día**:
The daily editorial pick, pushed with curiosity-gap copy; the reading screen takes its accent colors from the painting's own palette.

**Colección**:
A hand-curated, ordered grouping with one voice paragraph ("El canon español," "Luz y sombra").
_Avoid_: playlist, category

**Mitos destapados (view)**:
The auto-collection — a filter over typed curiosities. A view, not a Colección.

**Why_special**:
The single 3–5 sentence paragraph that makes an Artist page editorial.

**Lesson**:
The v2 deep-dive unit on an Artist's or Movement's language, with diagrams. The premium tier.

**Artist**:
An aggregation page — member Stories, connections, museums — plus its why_special. The fallback destination when a work isn't in the Catalog.

**Movement**:
Pure taxonomy in v1: grouping and routing only, no editorial surface.

## El Reconocimiento y la Demanda

**Smart miss**:
The screen that names what was scanned but isn't in the Catalog ("Es *Las Meninas* — aún no la hemos destapado") and offers Avísame.

**Avísame**:
The notify-me request; stores an anonymous push token, no account needed.

**Content request**:
One queued Avísame, channel vote, page form, or empty search. Collectively they are the demand signal that prioritizes enrichment.
_Avoid_: demand signal (as a record name)

**Requested_via**:
Where a content request came from: channel, artist_page, web_form, search_miss, story_page. scanner_miss joins at Phase 3.

**Confirm card**:
The medium-confidence question ("¿Es *El grito*?") whose tap doubles as accuracy telemetry.

**Artist-level fallback**:
Routing a request about an unknown work to the artist's page when the artist is known.

## El Cine

**Film**:
A reusable cinema entity (title, year, director). Recurs across connections and earns backward-browse pages.
_Avoid_: movie

**Film connection**:
The claim that a Film borrowed an Artwork's, Artist's, or Movement's language — what it borrowed, the mechanism, the evidence. The moat.
_Avoid_: homage, reference, easter egg

**Frame analysis**:
The written reconstruction of a shot (composition, light, geometry) with our own annotated diagram. Always load-bearing, never garnish.

## El Pipeline

**Created**:
First state — Met/Wikidata import or manual creation alike, with source_transcript when adapting an episode.

**Enriched**:
Rights checked, image assets selected, film connections drafted.

**Draft**:
Beats written, not live.

**Published**:
Live to the world (web page + app), independent of indexing.

## La Marca y los Productos

**Episode**:
The YouTube unit; one Artwork = one Short in v1, nullable link on Artwork or Artist. The episode is derivative; the Story is the source of truth.

**Public Story page**:
The read-only /obra/{slug} web page served by the dashboard — QR target, install funnel, SEO surface, Avísame without the app.

**Primary funnel**:
Video → QR → public page → install. The channel has the audience; the app starts with zero users. Measured as installs per 1,000 views per episode.

**Amplifier loop**:
App users tap "Ver el episodio" → watch time → the algorithm → reach → installs. Measured separately from the primary funnel.

**Phases**:
La Fundación (dashboard + slice), La Biblioteca (app + launch), El Escáner (scanner, gated).

**Readiness gates**:
The four Phase-3 triggers, dashboard-visible: catalog ≥ 50 published, vectors on 100% of scannable corpus, installs ≥ 500, D7 retention ≥ 15%.

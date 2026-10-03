// Import: external IDs (Wikidata + Met) — Phase 1 remainder (CANON.md).
//
// Fills artists.wikidata_id, artworks.wikidata_id, artworks.met_object_id.
// Seed rule: identifiers are never fabricated by hand — only a verified
// match writes. Conservative by design: ambiguous or unmatched → stays NULL.
//
// Run from apps/dashboard:   node scripts/import-external-ids.ts            (dry-run)
//                           node scripts/import-external-ids.ts --apply     (write)
//                           node scripts/import-external-ids.ts --force     (re-fill non-NULLs)
//
// Standalone on purpose: src/lib/supabase-server.ts is 'server-only' (Next bundle),
// so this script builds its own client from the same .env (SUPABASE_URL / SUPABASE_SECRET_KEY).
// Row shapes below mirror supabase/migrations/20260929120000_init_schema.sql.
//
// API notes (docs cached in .tmp/external-context/{wikidata-api,met-collection-api}/):
// - Wikidata: wbsearchentities → description filter → P170/P571 claim verification.
//   Serial requests, descriptive User-Agent, maxlag=5, honor Retry-After.
// - Met: v1.1 search (v1 retired 2026-10-01) → object endpoint; cross-check
//   artistWikidata_URL against our verified artist Q-ID (bulletproof signal).

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'node:url'

const WIKIDATA_API = 'https://www.wikidata.org/w/api.php'
const MET_SEARCH = 'https://collectionapi.metmuseum.org/public/collection/v1.1/search'
const MET_OBJECT = 'https://collectionapi.metmuseum.org/public/collection/v1/objects'

const USER_AGENT =
  'destapandoelarte-import/1.0 (local dev; contact: patrick@destapandoelarte.example)'

const WIKIDATA_DELAY_MS = 150
const MET_DELAY_MS = 500 // the Met WAF burst-blocks faster paces with 403s (observed 2026-10-01)

// ---------- Local row shapes (mirror the migration; types.ts is not imported to stay standalone) ----------

interface ArtistRow {
  id: string
  slug: string
  name: string
  wikidata_id: string | null
}

interface ArtworkRow {
  id: string
  slug: string
  title_es: string
  year: string | null
  wikidata_id: string | null
  met_object_id: number | null
  artists: Pick<ArtistRow, 'slug' | 'name'> | null
}

// ---------- Search config (editorial strings, not identifiers) ----------

interface ArtistSearch {
  searchName: string // cleaned name for wbsearchentities
  surname: string // token expected in candidate descriptions ("painting by <surname>")
}

const ARTIST_SEARCH: Record<string, ArtistSearch> = {
  'vincent-van-gogh': { searchName: 'Vincent van Gogh', surname: 'van Gogh' },
  'diego-velazquez': { searchName: 'Diego Velázquez', surname: 'Velázquez' },
  'johannes-vermeer': { searchName: 'Johannes Vermeer', surname: 'Vermeer' },
  'michelangelo-merisi-da-caravaggio': { searchName: 'Caravaggio', surname: 'Caravaggio' },
  'frida-kahlo': { searchName: 'Frida Kahlo', surname: 'Kahlo' },
}

interface ArtworkSearch {
  en: string // English title (wbsearchentities, language=en)
  metQuery?: string // Met search q (defaults to en); Met search matches title only via title=true
  wikidataQuery?: string // Wikidata search override when `en` is too generic
  pinnedQid?: string // editorial pick: skip search, verify P170/P571 directly
  pinnedYearOverride?: string // editorial reason bypassing the P571 gate for pinnedQid (bad external claim)
  metSkip?: string // editorial reason to leave met_object_id NULL
}

const ARTWORK_SEARCH: Record<string, ArtworkSearch> = {
  'noche-estrellada': { en: 'The Starry Night' },
  // Patrick 2026-10-02: la fila es la versión concreta de Arles 1888 (National Gallery),
  // no el ítem-serie Q157541; el Met 436524 es París 1887 — otra obra, queda NULL.
  girasoles: {
    en: 'Sunflowers',
    pinnedQid: 'Q21948567',
    metSkip: 'decisión editorial: versión Arles 1888; el Met 436524 (París 1887) es otra obra',
  },
  'la-habitacion-de-arles': { en: 'Bedroom in Arles' }, // serie Q724377 confirmada (ADR-0004 colapsa versiones)
  'autorretrato-van-gogh': { en: 'Self-Portrait', wikidataQuery: 'Van Gogh self-portrait' },
  'las-meninas': { en: 'Las Meninas' },
  // Q969377 es LA obra (única con este título + P170 ✓), pero Wikidata trae P571=1609
  // (fuente única errónea; el encargo Contarelli es 1599–1600). Patrick 2026-10-02.
  'la-vocacion-de-san-mateo': {
    en: 'The Calling of Saint Matthew',
    pinnedQid: 'Q969377',
    pinnedYearOverride: 'P571 de Wikidata (1609, una sola fuente) contradice el fechado universal 1599–1600',
  },
  'canasta-de-frutas': { en: 'Basket of Fruit' },
  'la-lechera': { en: 'The Milkmaid' },
  'chica-con-arete-de-perla': { en: 'Girl with a Pearl Earring' },
  'las-dos-fridas': { en: 'The Two Fridas' },
}

// ---------- Pure helpers ----------

/** '1888–1889' → {min:1888,max:1889}; 'c. 1596' → ±5; '1656' → exact. */
export function parseYearWindow(year: string | null): { min: number; max: number } | null {
  if (!year) return null
  // No trailing \b: after '.', a word boundary can never match ('c. 1596' would parse exact).
  const circa = /\bc\.|\bca\.|circa/i.test(year)
  const years = (year.match(/\d{4}/g) ?? []).map(Number)
  if (years.length === 0) return null
  const min = Math.min(...years)
  const max = Math.max(...years)
  const slack = circa ? 5 : 1
  return { min: min - slack, max: max + slack }
}

function yearInWindow(inceptionYear: number | null, window: { min: number; max: number } | null): boolean {
  if (inceptionYear === null) return true // no P571 parsed → don't reject on year alone
  if (window === null) return true
  return inceptionYear >= window.min && inceptionYear <= window.max
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------- Impure API shell (explicit fetch with UA + Retry-After) ----------

async function fetchJson(url: string, retries = 2): Promise<unknown> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  // 429/503 → honor Retry-After; 403 → Met WAF burst block, longer backoff.
  if ([403, 429, 503].includes(response.status) && retries > 0) {
    const retryAfter = Number(response.headers.get('retry-after') ?? 2)
    await sleep(response.status === 403 ? 5000 : Math.max(retryAfter * 1000, 2000))
    return fetchJson(url, retries - 1)
  }
  if (response.status === 404) throw new HttpError(404, url)
  if (!response.ok) throw new HttpError(response.status, url)
  return response.json()
}

class HttpError extends Error {
  status: number
  constructor(status: number, url: string) {
    super(`HTTP ${status}: ${url}`)
    this.status = status
  }
}

interface Candidate {
  id: string
  label: string
  description: string
}

/** Wikidata response-level errors (maxlag etc.) must be loud, never a silent empty list. */
function assertNoWikidataError(json: unknown): void {
  if (typeof json === 'object' && json !== null && 'error' in json) {
    const err = (json as { error?: { code?: string; info?: string } }).error
    throw new Error(`Wikidata ${err?.code ?? 'error'}: ${err?.info ?? 'desconocido'}`)
  }
}

async function wdSearch(term: string): Promise<Candidate[]> {
  const params = new URLSearchParams({
    action: 'wbsearchentities',
    search: term,
    language: 'en',
    limit: '20',
    type: 'item',
    format: 'json',
  })
  const json = (await fetchJson(`${WIKIDATA_API}?${params}`)) as {
    search?: Candidate[]
    error?: unknown
  }
  assertNoWikidataError(json)
  return json.search ?? []
}

/** Returns the first non-null mainsnak datavalue id/time for a property. */
async function wdClaims(
  qid: string,
): Promise<{ creatorQid: string | null; inceptionYear: number | null }> {
  const params = new URLSearchParams({
    action: 'wbgetclaims',
    entity: qid,
    format: 'json',
  })
  type Claim = { mainsnak?: { datavalue?: { value?: unknown } } }
  const json = (await fetchJson(`${WIKIDATA_API}?${params}`)) as {
    claims?: Record<string, Claim[] | undefined>
    error?: unknown
  }
  assertNoWikidataError(json)
  const firstId = (props?: Claim[]): string | null => {
    const value = props?.[0]?.mainsnak?.datavalue?.value
    return typeof value === 'object' && value !== null && 'id' in value
      ? String((value as { id: unknown }).id)
      : null
  }
  const timeValue = json.claims?.P571?.[0]?.mainsnak?.datavalue?.value as
    | { time?: string }
    | undefined
  const inceptionYear = timeValue?.time ? Number(timeValue.time.slice(1, 5)) : null
  return { creatorQid: firstId(json.claims?.P170), inceptionYear }
}

interface MetObject {
  title: string
  artistWikidata_URL: string | null
  objectBeginDate: number
  objectEndDate: number
}

async function metSearchIds(query: string): Promise<number[]> {
  const params = new URLSearchParams({
    q: query,
    title: 'true',
    limit: '50',
  })
  const json = (await fetchJson(`${MET_SEARCH}?${params}`)) as { objectIDs?: number[] | null }
  return json.objectIDs ?? []
}

async function metObject(id: number): Promise<MetObject | null> {
  // 404 = stale/deaccessioned search ID → skip, not a failure.
  try {
    const json = (await fetchJson(`${MET_OBJECT}/${id}`)) as Partial<MetObject>
    if (typeof json.title !== 'string') return null
    return {
      title: json.title,
      artistWikidata_URL: json.artistWikidata_URL ?? null,
      objectBeginDate: json.objectBeginDate ?? 0,
      objectEndDate: json.objectEndDate ?? 0,
    }
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null
    throw error
  }
}

// ---------- Matchers (pure decisions over fetched data) ----------

export function pickArtistCandidate(
  candidates: Candidate[],
): { candidate: Candidate; reason: string } | null {
  const painters = candidates.filter((c) => /\bpainter\b/i.test(c.description))
  if (painters.length === 0) return null
  return {
    candidate: painters[0],
    reason: `descripción: "${painters[0].description}"`,
  }
}

/** Up to 4 description-matching candidates; each gets its shot at P170/P571 verification. */
export function pickArtworkCandidates(
  candidates: Candidate[],
  surname: string,
): Candidate[] {
  return candidates
    .filter((c) => /painting/i.test(c.description) && c.description.includes(surname))
    .slice(0, 4)
}

// ---------- Orchestration ----------

interface Verdict {
  slug: string
  table: 'artists' | 'artworks'
  field: 'wikidata_id' | 'met_object_id'
  current: string | number | null
  proposed: string | number | null
  evidence: string
  status: 'MATCH' | 'NULL' | 'AMBIGUOUS' | 'SKIP' | 'ERROR'
}

function line(char = '-'): string {
  return char.repeat(96)
}

function printVerdicts(title: string, verdicts: Verdict[]): void {
  console.log(`\n${title}`)
  console.log(line())
  for (const v of verdicts) {
    const current = v.current === null ? '—' : String(v.current)
    const proposed = v.proposed === null ? '—' : String(v.proposed)
    console.log(
      `[${v.status.padEnd(9)}] ${v.slug} · ${v.field}  (${current} → ${proposed})\n` +
        `             ${v.evidence}`,
    )
  }
}

async function resolveArtists(
  artists: ArtistRow[],
  force: boolean,
): Promise<{ verdicts: Verdict[]; artistQids: Map<string, string | null> }> {
  const verdicts: Verdict[] = []
  const artistQids = new Map<string, string | null>()
  for (const artist of artists) {
    const cfg = ARTIST_SEARCH[artist.slug]
    if (artist.wikidata_id && !force) {
      artistQids.set(artist.slug, artist.wikidata_id)
      verdicts.push(skipVerdict(WIKIDATA_ARTIST, artist.slug, artist.wikidata_id))
      continue
    }
    if (!cfg) {
      artistQids.set(artist.slug, null)
      verdicts.push(nullVerdict(WIKIDATA_ARTIST, artist.slug, 'sin configuración de búsqueda'))
      continue
    }
    try {
      await sleep(WIKIDATA_DELAY_MS)
      const picked = pickArtistCandidate(await wdSearch(cfg.searchName))
      if (!picked) {
        artistQids.set(artist.slug, null)
        verdicts.push(nullVerdict(WIKIDATA_ARTIST, artist.slug, 'ningún candidato con descripción "painter"'))
        continue
      }
      artistQids.set(artist.slug, picked.candidate.id)
      verdicts.push(matchVerdict(WIKIDATA_ARTIST, artist.slug, artist.wikidata_id, picked.candidate.id, picked.reason))
    } catch (error) {
      artistQids.set(artist.slug, null)
      verdicts.push(errorVerdict(WIKIDATA_ARTIST, artist.slug, error))
    }
  }
  return { verdicts, artistQids }
}

/** Editorial bypass of the P571 gate, valid only for one pinned Q-ID. */
interface YearOverride {
  qid: string
  reason: string
}

/** Walks candidates through the P170/P571 gates; first pass wins, all-reject → AMBIGUOUS. */
async function verifyArtworkWikidata(
  artwork: ArtworkRow,
  candidates: Candidate[],
  artistQid: string | null,
  override?: YearOverride,
): Promise<Verdict> {
  const window = parseYearWindow(artwork.year)
  const rejects: string[] = []
  for (const candidate of candidates) {
    await sleep(WIKIDATA_DELAY_MS)
    const claims = await wdClaims(candidate.id)
    if (artistQid && claims.creatorQid !== artistQid) {
      rejects.push(`${candidate.id}:P170=${claims.creatorQid ?? '—'}`)
      continue
    }
    if (!yearInWindow(claims.inceptionYear, window)) {
      if (override && override.qid === candidate.id) {
        return matchVerdict(
          WIKIDATA_ARTWORK,
          artwork.slug,
          artwork.wikidata_id,
          candidate.id,
          `"${candidate.description}" · P170 ✓ · P571 ${claims.inceptionYear} ✗ anulado editorialmente: ${override.reason}`,
        )
      }
      rejects.push(`${candidate.id}:P571=${claims.inceptionYear ?? '—'}`)
      continue
    }
    return matchVerdict(
      WIKIDATA_ARTWORK,
      artwork.slug,
      artwork.wikidata_id,
      candidate.id,
      `"${candidate.description}" · P170 ✓${claims.inceptionYear ? ` · P571 ${claims.inceptionYear} ✓` : ''}${rejects.length ? ` · descartados: ${rejects.join(', ')}` : ''}`,
    )
  }
  return ambiguousVerdict(WIKIDATA_ARTWORK, artwork.slug, rejects.join(' · '))
}

async function resolveWikidata(
  artworks: ArtworkRow[],
  artistQids: Map<string, string | null>,
  force: boolean,
): Promise<Verdict[]> {
  const verdicts: Verdict[] = []
  for (const artwork of artworks) {
    const cfg = ARTWORK_SEARCH[artwork.slug]
    const artistCfg = artwork.artists ? ARTIST_SEARCH[artwork.artists.slug] : undefined
    if (artwork.wikidata_id && !force) {
      verdicts.push(skipVerdict(WIKIDATA_ARTWORK, artwork.slug, artwork.wikidata_id))
      continue
    }
    if (!cfg || !artistCfg || !artwork.artists) {
      verdicts.push(nullVerdict(WIKIDATA_ARTWORK, artwork.slug, 'sin configuración de búsqueda o sin artista'))
      continue
    }
    const artistQid = artistQids.get(artwork.artists.slug) ?? null
    try {
      // Pinned Q-ID (editorial pick): skip search, straight to hard verification.
      const candidates: Candidate[] = cfg.pinnedQid
        ? [{ id: cfg.pinnedQid, label: cfg.pinnedQid, description: 'fijado editorialmente' }]
        : await searchArtworkCandidates(cfg, artistCfg.surname)
      if (candidates.length === 0) {
        verdicts.push(nullVerdict(WIKIDATA_ARTWORK, artwork.slug, 'ningún candidato "painting by ' + artistCfg.surname + '"'))
        continue
      }
      const override: YearOverride | undefined =
        cfg.pinnedQid && cfg.pinnedYearOverride
          ? { qid: cfg.pinnedQid, reason: cfg.pinnedYearOverride }
          : undefined
      verdicts.push(await verifyArtworkWikidata(artwork, candidates, artistQid, override))
    } catch (error) {
      verdicts.push(errorVerdict(WIKIDATA_ARTWORK, artwork.slug, error))
    }
  }
  return verdicts
}

async function searchArtworkCandidates(cfg: ArtworkSearch, surname: string): Promise<Candidate[]> {
  await sleep(WIKIDATA_DELAY_MS)
  return pickArtworkCandidates(await wdSearch(cfg.wikidataQuery ?? cfg.en), surname)
}

async function resolveMet(
  artworks: ArtworkRow[],
  artistQids: Map<string, string | null>,
  force: boolean,
): Promise<Verdict[]> {
  const verdicts: Verdict[] = []
  for (const artwork of artworks) {
    const cfg = ARTWORK_SEARCH[artwork.slug]
    if (artwork.met_object_id && !force) {
      verdicts.push(skipVerdict(MET_ARTWORK, artwork.slug, artwork.met_object_id))
      continue
    }
    if (!cfg || !artwork.artists) {
      verdicts.push(nullVerdict(MET_ARTWORK, artwork.slug, 'sin configuración de búsqueda o sin artista'))
      continue
    }
    if (cfg.metSkip) {
      verdicts.push(nullVerdict(MET_ARTWORK, artwork.slug, cfg.metSkip))
      continue
    }
    const artistQid = artistQids.get(artwork.artists.slug) ?? null
    try {
      await sleep(MET_DELAY_MS)
      const ids = (await metSearchIds(cfg.metQuery ?? cfg.en)).slice(0, 10)
      const window = parseYearWindow(artwork.year)
      let matched: { id: number; object: MetObject } | null = null
      for (const id of ids) {
        await sleep(MET_DELAY_MS)
        const object = await metObject(id)
        if (!object) continue
        const wikidataMatch =
          !!object.artistWikidata_URL && !!artistQid && object.artistWikidata_URL.endsWith(`/${artistQid}`)
        // Overlap of [objectBeginDate, objectEndDate] with the year window.
        const yearMatch =
          window === null || object.objectEndDate >= window.min - 3 && object.objectBeginDate <= window.max + 3
        if (wikidataMatch && yearMatch) {
          matched = { id, object }
          break
        }
      }
      if (!matched) {
        verdicts.push(nullVerdict(MET_ARTWORK, artwork.slug, 'no está en la colección del Met (esperado)'))
        continue
      }
      verdicts.push(
        matchVerdict(
          MET_ARTWORK,
          artwork.slug,
          artwork.met_object_id,
          matched.id,
          `"${matched.object.title}" · artistWikidata_URL ✓ (${matched.object.objectBeginDate}–${matched.object.objectEndDate})`,
        ),
      )
    } catch (error) {
      verdicts.push(errorVerdict(MET_ARTWORK, artwork.slug, error))
    }
  }
  return verdicts
}

// ---------- Verdict constructors ----------

type Target = { table: 'artists' | 'artworks'; field: Verdict['field'] }

const WIKIDATA_ARTIST: Target = { table: 'artists', field: 'wikidata_id' }
const WIKIDATA_ARTWORK: Target = { table: 'artworks', field: 'wikidata_id' }
const MET_ARTWORK: Target = { table: 'artworks', field: 'met_object_id' }

function matchVerdict(
  target: Target,
  slug: string,
  current: string | number | null,
  proposed: string | number,
  evidence: string,
): Verdict {
  return { slug, field: target.field, table: target.table, current, proposed, evidence, status: 'MATCH' }
}

function skipVerdict(target: Target, slug: string, current: string | number | null): Verdict {
  return { slug, field: target.field, table: target.table, current, proposed: null, evidence: 'ya tiene ID (--force para rellenar)', status: 'SKIP' }
}

function nullVerdict(target: Target, slug: string, reason: string): Verdict {
  return { slug, field: target.field, table: target.table, current: null, proposed: null, evidence: reason, status: 'NULL' }
}

function ambiguousVerdict(target: Target, slug: string, reason: string): Verdict {
  return { slug, field: target.field, table: target.table, current: null, proposed: null, evidence: reason, status: 'AMBIGUOUS' }
}

function errorVerdict(target: Target, slug: string, error: unknown): Verdict {
  return { slug, field: target.field, table: target.table, current: null, proposed: null, evidence: error instanceof Error ? error.message : String(error), status: 'ERROR' }
}

// ---------- Main ----------

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const force = process.argv.includes('--force')
  console.log(
    `Import de IDs externos — modo ${apply ? 'APPLY (escribe en la BD)' : 'DRY-RUN (solo lectura)'}${force ? ' + --force' : ''}`,
  )

  try {
    process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
  } catch {
    // .env may already be present via the shell; validate below either way.
  }
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) {
    throw new Error('Faltan SUPABASE_URL / SUPABASE_SECRET_KEY (apps/dashboard/.env)')
  }
  const db = createClient(url, key, { auth: { persistSession: false } })

  const { data: artists, error: artistsError } = await db
    .from('artists')
    .select('id, slug, name, wikidata_id')
    .order('slug')
  if (artistsError) throw new Error(`Artistas: ${artistsError.message}`)

  const { data: artworks, error: artworksError } = await db
    .from('artworks')
    .select('id, slug, title_es, year, wikidata_id, met_object_id, artists(slug, name)')
    .order('slug')
  if (artworksError) throw new Error(`Obras: ${artworksError.message}`)
  // artists(artist_id) is many-to-one; supabase-js's untyped client can't know — cast at the boundary
  // (same pattern as src/lib/artworks.ts `as CatalogRow[]`).
  const artworkRows = (artworks ?? []) as unknown as ArtworkRow[]

  // Phase A: artists (Wikidata) — their verified Q-IDs feed the artwork checks.
  const { verdicts: artistVerdicts, artistQids } = await resolveArtists(artists ?? [], force)
  printVerdicts('Artistas — wikidata_id', artistVerdicts)

  // Phase B: artworks (Wikidata) — description filter + P170/P571 verification.
  const wikidataVerdicts = await resolveWikidata(artworkRows, artistQids, force)
  printVerdicts('Obras — wikidata_id', wikidataVerdicts)

  // Phase C: artworks (Met) — only a genuine Met holding matches; NULL is honest.
  const metVerdicts = await resolveMet(artworkRows, artistQids, force)
  printVerdicts('Obras — met_object_id', metVerdicts)

  const all = [...artistVerdicts, ...wikidataVerdicts, ...metVerdicts]
  const counts = all.reduce<Record<string, number>>((acc, v) => {
    acc[v.status] = (acc[v.status] ?? 0) + 1
    return acc
  }, {})
  console.log(`\n${line('=')}`)
  console.log(
    `Resumen: ${Object.entries(counts)
      .map(([k, n]) => `${k}=${n}`)
      .join(' · ')}`,
  )

  if (!apply) {
    console.log('Dry-run: nada escrito. Re-ejecuta con --apply para escribir los MATCH.')
    return
  }

  let written = 0
  for (const v of all) {
    if (v.status !== 'MATCH' || v.proposed === null) continue
    const payload =
      v.field === 'met_object_id' ? { met_object_id: v.proposed } : { wikidata_id: v.proposed }
    const record = v.table === 'artworks' ? { ...payload, updated_at: new Date().toISOString() } : payload
    const { error } = await db.from(v.table).update(record).eq('slug', v.slug)
    if (error) {
      console.log(`✗ ${v.slug}.${v.field}: ${error.message}`)
    } else {
      written += 1
      console.log(`✓ ${v.slug}.${v.field} → ${v.proposed}`)
    }
  }
  console.log(`\nAplicados ${written} campos en la BD.`)
}

main().catch((error) => {
  console.error(`Fallo: ${error instanceof Error ? error.message : error}`)
  process.exit(1)
})

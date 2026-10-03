import { removeConnection, saveConnection } from '@/lib/actions'
import type { ConnectionRow } from '@/lib/artworks'
import { caption, card, danger, field, primary } from './styles'

export function ConnectionsEditor({
  artworkId,
  slug,
  connections,
}: {
  artworkId: string
  slug: string
  connections: ConnectionRow[]
}) {
  return (
    <section className={card}>
      <h2 className="text-lg font-semibold">Conexiones cinematográficas — el foso (moat)</h2>
      <p className="mt-1 text-sm text-zinc-500">
        ADR-0014: el análisis de plano es obligatorio — ninguna afirmación descansa en un
        enlace que no controlamos. El embed es adorno.
      </p>

      <ul className="mt-4 space-y-3">
        {connections.map((connection) => (
          <li key={connection.id} className="rounded-lg border border-zinc-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {connection.films?.title}
                  {connection.films?.year ? ` (${connection.films.year})` : ''}
                  {connection.films?.director ? ` — ${connection.films.director}` : ''}
                </p>
                <p className="mt-1 text-sm text-zinc-700">{connection.what_it_borrowed}</p>
                <p className="mt-1 text-sm text-zinc-500">{connection.mechanism}</p>
              </div>
              <form action={removeConnection}>
                <input type="hidden" name="id" value={connection.id} />
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className={danger}>quitar</button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <form action={saveConnection} className="mt-6 space-y-3 border-t border-zinc-200 pt-6">
        <input type="hidden" name="artwork_id" value={artworkId} />
        <input type="hidden" name="slug" value={slug} />
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={caption} htmlFor="film-title">Película</label>
            <input className={`${field} mt-1`} id="film-title" name="film_title" required />
          </div>
          <div>
            <label className={caption} htmlFor="film-year">Año</label>
            <input className={`${field} mt-1`} id="film-year" name="film_year" type="number" />
          </div>
          <div>
            <label className={caption} htmlFor="film-director">Director</label>
            <input className={`${field} mt-1`} id="film-director" name="film_director" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={caption} htmlFor="what-borrowed">Qué tomó prestado</label>
            <input className={`${field} mt-1`} id="what-borrowed" name="what_it_borrowed"
              placeholder="la luz, el encuadre, la paleta…" />
          </div>
          <div>
            <label className={caption} htmlFor="evidence-visual">Evidencia visual</label>
            <select className={`${field} mt-1`} id="evidence-visual" name="evidence_visual" defaultValue="none">
              <option value="none">ninguna</option>
              <option value="our_diagram">nuestro diagrama</option>
              <option value="youtube_embed">embed de YouTube</option>
              <option value="both">ambos</option>
            </select>
          </div>
        </div>
        <div>
          <label className={caption} htmlFor="mechanism">Mecanismo — la afirmación concreta</label>
          <input className={`${field} mt-1`} id="mechanism" name="mechanism" />
        </div>
        <div>
          <label className={caption} htmlFor="frame-analysis">
            Análisis de plano (obligatorio, ADR-0014)
          </label>
          <textarea className={`${field} mt-1`} id="frame-analysis" name="frame_analysis_text"
            rows={3} required
            placeholder="Reconstrucción escrita del plano: composición, dirección de la luz, geometría…" />
        </div>
        <div>
          <label className={caption} htmlFor="evidence-url">URL de evidencia (adorno)</label>
          <input className={`${field} mt-1`} id="evidence-url" name="evidence_url" type="url" />
        </div>
        <button type="submit" className={primary}>Añadir conexión</button>
      </form>
    </section>
  )
}

import { saveBeats } from '@/lib/actions'
import type { Artwork } from '@/lib/types'
import { caption, card, field, primary } from './styles'

export function BeatsForm({ artwork }: { artwork: Artwork }) {
  return (
    <section className={card}>
      <h2 className="text-lg font-semibold">La historia — cuatro beats</h2>
      <form action={saveBeats} className="mt-4 space-y-4">
        <input type="hidden" name="slug" value={artwork.slug} />

        <div>
          <label className={caption} htmlFor="summary">Resumen — qué es</label>
          <textarea className={`${field} mt-1`} id="summary" name="summary" rows={3}
            defaultValue={artwork.summary ?? ''} />
        </div>

        <div>
          <label className={caption} htmlFor="why_it_matters">
            Por qué importa — el argumento (2–3 frases, obligatorio)
          </label>
          <textarea className={`${field} mt-1`} id="why_it_matters" name="why_it_matters" rows={3}
            defaultValue={artwork.why_it_matters ?? ''} />
        </div>

        <div>
          <label className={caption} htmlFor="essay">
            Ensayo — la única escapatoria libre (opcional)
          </label>
          <textarea className={`${field} mt-1`} id="essay" name="essay" rows={5}
            defaultValue={artwork.essay ?? ''} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={caption} htmlFor="source_transcript">
              Transcripción fuente (ADR-0013: sin transcripción no hay descuento)
            </label>
            <textarea className={`${field} mt-1`} id="source_transcript" name="source_transcript" rows={3}
              defaultValue={artwork.source_transcript ?? ''} />
          </div>
          <div>
            <label className={caption} htmlFor="episode_youtube_id">Episodio (YouTube ID)</label>
            <input className={`${field} mt-1`} id="episode_youtube_id" name="episode_youtube_id"
              defaultValue={artwork.episode_youtube_id ?? ''} placeholder="dQw4w9WgXcQ" />
          </div>
        </div>

        <button type="submit" className={primary}>Guardar beats</button>
      </form>
    </section>
  )
}

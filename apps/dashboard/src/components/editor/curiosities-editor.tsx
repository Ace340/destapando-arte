import { createCuriosity, removeCuriosity } from '@/lib/actions'
import { CuriosityBadge } from '@/components/badges'
import type { Curiosity } from '@/lib/types'
import { caption, card, danger, field, primary } from './styles'

export function CuriositiesEditor({
  artworkId,
  slug,
  curiosities,
}: {
  artworkId: string
  slug: string
  curiosities: Curiosity[]
}) {
  return (
    <section className={card}>
      <h2 className="text-lg font-semibold">Curiosidades — tipadas y con fuente (ADR-0007)</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Sin fuente no hay curiosidad. «Mito destapado» es el contenido premium: la leyenda
        dice X, la evidencia dice Y.
      </p>

      <ul className="mt-4 space-y-3">
        {curiosities.map((curiosity) => (
          <li key={curiosity.id} className="rounded-lg border border-zinc-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CuriosityBadge type={curiosity.type} />
                <p className="mt-2 text-sm text-zinc-900">{curiosity.text}</p>
                <a className="mt-1 inline-block text-xs text-sky-700 underline"
                  href={curiosity.source_url} target="_blank" rel="noopener noreferrer">
                  fuente: {curiosity.source_note ?? curiosity.source_url}
                </a>
              </div>
              <form action={removeCuriosity}>
                <input type="hidden" name="id" value={curiosity.id} />
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className={danger}>quitar</button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <form action={createCuriosity} className="mt-6 space-y-3 border-t border-zinc-200 pt-6">
        <input type="hidden" name="artwork_id" value={artworkId} />
        <input type="hidden" name="slug" value={slug} />
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label className={caption} htmlFor="curiosity-text">Nueva curiosidad</label>
            <textarea className={`${field} mt-1`} id="curiosity-text" name="text" rows={2} required />
          </div>
          <div>
            <label className={caption} htmlFor="curiosity-type">Tipo</label>
            <select className={`${field} mt-1`} id="curiosity-type" name="type" defaultValue="fact">
              <option value="fact">dato</option>
              <option value="myth">mito destapado</option>
              <option value="legend">leyenda</option>
            </select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={caption} htmlFor="curiosity-source">Fuente (URL, obligatoria)</label>
            <input className={`${field} mt-1`} id="curiosity-source" name="source_url" type="url" required />
          </div>
          <div>
            <label className={caption} htmlFor="curiosity-note">Nota de fuente</label>
            <input className={`${field} mt-1`} id="curiosity-note" name="source_note" />
          </div>
        </div>
        <button type="submit" className={primary}>Añadir curiosidad</button>
      </form>
    </section>
  )
}

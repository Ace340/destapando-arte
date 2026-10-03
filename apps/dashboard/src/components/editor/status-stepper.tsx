import { advance } from '@/lib/actions'
import type { StoryStatus } from '@/lib/types'
import { primary } from './styles'

// ADR-0005: created → enriched → draft → published, forward-only.
const NEXT_LABEL: Record<StoryStatus, string | null> = {
  created: 'Enriquecer',
  enriched: 'Pasar a borrador',
  draft: 'Publicar',
  published: null,
}

const ORDER: StoryStatus[] = ['created', 'enriched', 'draft', 'published']

export function StatusStepper({ slug, status }: { slug: string; status: StoryStatus }) {
  const next = NEXT_LABEL[status]
  const current = ORDER.indexOf(status)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ol className="flex items-center gap-1.5 text-xs">
        {ORDER.map((step, index) => (
          <li
            key={step}
            className={`rounded-full px-2.5 py-0.5 ${
              index === current
                ? 'bg-zinc-900 text-white'
                : index < current
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            {step}
          </li>
        ))}
      </ol>
      {next ? (
        <form action={advance}>
          <input type="hidden" name="slug" value={slug} />
          <button type="submit" className={primary}>
            {next}
          </button>
        </form>
      ) : (
        <span className="text-xs text-emerald-700">publicada ✓</span>
      )}
    </div>
  )
}

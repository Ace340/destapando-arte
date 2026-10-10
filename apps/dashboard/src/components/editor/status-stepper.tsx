import { advance } from '@/lib/actions'
import type { StoryStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
      <ol className="flex items-center gap-1.5">
        {ORDER.map((step, index) => (
          <li key={step}>
            <Badge
              className={
                index === current
                  ? 'bg-primary text-primary-foreground'
                  : index < current
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
              }
            >
              {step}
            </Badge>
          </li>
        ))}
      </ol>
      {next ? (
        <form action={advance}>
          <input type="hidden" name="slug" value={slug} />
          <Button type="submit" size="sm">
            {next}
          </Button>
        </form>
      ) : (
        <span className="text-xs text-emerald-700 dark:text-emerald-400">
          publicada ✓
        </span>
      )}
    </div>
  )
}

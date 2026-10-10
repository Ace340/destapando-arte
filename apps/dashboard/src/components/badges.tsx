import { Badge } from '@/components/ui/badge'
import type { CuriosityType, RightsStatus, StoryStatus } from '@/lib/types'

// Domain chips over the shadcn Badge primitive — one tint per canonical state,
// readable in light and dark. Labels follow the glossary (avoid: version, copy…).

const STORY_STYLES: Record<StoryStatus, { label: string; className: string }> = {
  created: {
    label: 'creada',
    className: 'bg-zinc-200/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  },
  enriched: {
    label: 'enriquecida',
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  },
  draft: {
    label: 'borrador',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  published: {
    label: 'publicada',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
}

export function StatusBadge({ status }: { status: StoryStatus }) {
  const style = STORY_STYLES[status]
  return (
    <Badge variant="secondary" className={style.className}>
      {style.label}
    </Badge>
  )
}

export function RightsBadge({ status }: { status: RightsStatus }) {
  const blocked = status === 'blocked'
  return (
    <Badge
      variant="secondary"
      className={
        blocked
          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
          : 'bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
      }
      title={
        blocked
          ? 'ADR-0003: solo lección, nunca escaneable'
          : 'dominio público verificado en enriched'
      }
    >
      {blocked ? 'solo lección' : 'derechos ok'}
    </Badge>
  )
}

const CURIOSITY_STYLES: Record<CuriosityType, { label: string; className: string }> = {
  fact: {
    label: 'dato',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  myth: {
    label: 'mito destapado',
    className:
      'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  },
  legend: {
    label: 'leyenda',
    className: 'bg-zinc-200/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  },
}

export function CuriosityBadge({ type }: { type: CuriosityType }) {
  const style = CURIOSITY_STYLES[type]
  return (
    <Badge variant="secondary" className={style.className}>
      {style.label}
    </Badge>
  )
}

export function IndexedBadge() {
  return (
    <Badge
      variant="secondary"
      className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
      title="glosario: publicada E indexada — vectores en el índice de reconocimiento"
    >
      indexada
    </Badge>
  )
}

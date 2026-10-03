import type { CuriosityType, RightsStatus, StoryStatus } from '@/lib/types'

const STORY_STYLES: Record<StoryStatus, { label: string; className: string }> = {
  created: { label: 'creada', className: 'bg-zinc-200 text-zinc-700' },
  enriched: { label: 'enriquecida', className: 'bg-sky-100 text-sky-800' },
  draft: { label: 'borrador', className: 'bg-amber-100 text-amber-800' },
  published: { label: 'publicada', className: 'bg-emerald-100 text-emerald-800' },
}

export function StatusBadge({ status }: { status: StoryStatus }) {
  const style = STORY_STYLES[status]
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
      {style.label}
    </span>
  )
}

export function RightsBadge({ status }: { status: RightsStatus }) {
  const blocked = status === 'blocked'
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        blocked ? 'bg-red-100 text-red-800' : 'bg-zinc-100 text-zinc-600'
      }`}
      title={blocked ? 'ADR-0003: solo lección, nunca escaneable' : 'dominio público verificado en enriched'}
    >
      {blocked ? 'solo lección' : 'derechos ok'}
    </span>
  )
}

const CURIOSITY_STYLES: Record<CuriosityType, { label: string; className: string }> = {
  fact: { label: 'dato', className: 'bg-emerald-100 text-emerald-800' },
  myth: { label: 'mito destapado', className: 'bg-fuchsia-100 text-fuchsia-800' },
  legend: { label: 'leyenda', className: 'bg-zinc-200 text-zinc-700' },
}

export function CuriosityBadge({ type }: { type: CuriosityType }) {
  const style = CURIOSITY_STYLES[type]
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
      {style.label}
    </span>
  )
}

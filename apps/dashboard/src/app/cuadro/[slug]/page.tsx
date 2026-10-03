import Link from 'next/link'
import { notFound } from 'next/navigation'
import { get } from '@/lib/artworks'
import { isConfigured } from '@/lib/supabase-server'
import { RightsBadge, StatusBadge } from '@/components/badges'
import { SetupNotice } from '@/components/setup-notice'
import { BeatsForm } from '@/components/editor/beats-form'
import { ConnectionsEditor } from '@/components/editor/connections-editor'
import { CuriositiesEditor } from '@/components/editor/curiosities-editor'
import { StatusStepper } from '@/components/editor/status-stepper'

export const dynamic = 'force-dynamic'

export default async function Page(props: PageProps<'/cuadro/[slug]'>) {
  if (!isConfigured()) return <SetupNotice />
  const { slug } = await props.params
  const bundle = await get(slug)
  if (!bundle) notFound()

  const { artwork, curiosities, connections } = bundle

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <header className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Link className="text-zinc-500 underline" href="/">← catálogo</Link>
          {artwork.story_status === 'published' ? (
            <Link className="text-zinc-500 underline" href={`/obra/${artwork.slug}`}>
              ver página pública ↗
            </Link>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold">
          {artwork.title_es}
          <span className="ml-2 text-base font-normal text-zinc-400">{artwork.year}</span>
        </h1>
        <p className="text-zinc-600">{artwork.artists?.name ?? '—'}</p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={artwork.story_status} />
          <RightsBadge status={artwork.rights_status} />
          {artwork.indexed ? (
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
              indexada
            </span>
          ) : null}
        </div>
        <StatusStepper slug={artwork.slug} status={artwork.story_status} />
      </header>

      <BeatsForm artwork={artwork} />
      <CuriositiesEditor artworkId={artwork.id} slug={artwork.slug} curiosities={curiosities} />
      <ConnectionsEditor artworkId={artwork.id} slug={artwork.slug} connections={connections} />
    </main>
  )
}

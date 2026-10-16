import { notFound } from 'next/navigation'
import { get } from '@/lib/artworks'
import { isConfigured } from '@/lib/supabase-server'
import { IndexedBadge, RightsBadge, StatusBadge } from '@/components/badges'
import { SetupNotice } from '@/components/setup-notice'
import { ButtonLink } from '@/components/button-link'
import { BeatsForm } from '@/components/editor/beats-form'
import { ConnectionsEditor } from '@/components/editor/connections-editor'
import { CuriositiesEditor } from '@/components/editor/curiosities-editor'
import { ImagesEditor } from '@/components/editor/images-editor'
import { StatusStepper } from '@/components/editor/status-stepper'

export const dynamic = 'force-dynamic'

export default async function Page(props: PageProps<'/cuadro/[slug]'>) {
  if (!isConfigured()) return <SetupNotice />
  const { slug } = await props.params
  const bundle = await get(slug)
  if (!bundle) notFound()

  const { artwork, curiosities, connections, images } = bundle

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-12">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <ButtonLink variant="link" size="sm" href="/">
            ← catálogo
          </ButtonLink>
          {artwork.story_status === 'published' ? (
            <ButtonLink
              variant="link"
              size="sm"
              href={`/obra/${artwork.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              ver página pública ↗
            </ButtonLink>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold">
          {artwork.title_es}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            {artwork.year}
          </span>
        </h1>
        <p className="text-muted-foreground">{artwork.artists?.name ?? '—'}</p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={artwork.story_status} />
          <RightsBadge status={artwork.rights_status} />
          {artwork.indexed ? <IndexedBadge /> : null}
        </div>
        <StatusStepper slug={artwork.slug} status={artwork.story_status} />
      </header>

      <ImagesEditor
        artworkId={artwork.id}
        slug={artwork.slug}
        images={images}
        blocked={artwork.rights_status === 'blocked'}
      />
      <BeatsForm artwork={artwork} />
      <CuriositiesEditor artworkId={artwork.id} slug={artwork.slug} curiosities={curiosities} />
      <ConnectionsEditor artworkId={artwork.id} slug={artwork.slug} connections={connections} />
    </main>
  )
}

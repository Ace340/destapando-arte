import { notFound } from 'next/navigation'
import { getArtist } from '@/lib/artists'
import { isConfigured } from '@/lib/supabase-server'
import { StatusBadge } from '@/components/badges'
import { SetupNotice } from '@/components/setup-notice'
import { ButtonLink } from '@/components/button-link'
import { ArtistForm } from '@/components/editor/artist-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const dynamic = 'force-dynamic'

// The Tablero's artist editor. Route word follows the obra/cuadro split
// (public /artista vs Tablero /taller): different surfaces, different words.
export default async function Page(props: PageProps<'/taller/[slug]'>) {
  if (!isConfigured()) return <SetupNotice />
  const { slug } = await props.params
  const bundle = await getArtist(slug)
  if (!bundle) notFound()

  const { artist, obras } = bundle
  const published = obras.filter((obra) => obra.story_status === 'published').length

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-12">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <ButtonLink variant="link" size="sm" href="/">
            ← catálogo
          </ButtonLink>
          <ButtonLink
            variant="link"
            size="sm"
            href={`/artista/${artist.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            ver página pública ↗
          </ButtonLink>
        </div>
        <h1 className="text-2xl font-semibold">{artist.name}</h1>
        <p className="text-muted-foreground">
          {published}/{obras.length} obras publicadas
        </p>
      </header>

      <ArtistForm artist={artist} />

      {obras.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Obras</CardTitle>
            <CardDescription>
              La lista derivada — crece a medida que publicas obras de este artista.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {obras.map((obra) => (
                <li key={obra.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{obra.title_es}</span>
                    {obra.year ? (
                      <span className="text-xs text-muted-foreground">{obra.year}</span>
                    ) : null}
                    <StatusBadge status={obra.story_status} />
                  </div>
                  <ButtonLink variant="link" size="sm" href={`/cuadro/${obra.slug}`}>
                    editar
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </main>
  )
}

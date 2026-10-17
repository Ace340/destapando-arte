import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createRequest } from '@/lib/actions'
import { getArtist, type ArtistBundle } from '@/lib/artists'
import { isConfigured } from '@/lib/supabase-server'
import { SetupNotice } from '@/components/setup-notice'

export const dynamic = 'force-dynamic'

type Props = PageProps<'/artista/[slug]'>

// Public truth gate (ADR-0022): the Artist page exists for every artist —
// even with zero obras it is the dignified stub (hook + Avísame + episode)
// serving artist-level fallback duty. Obras is the derived view: published
// member Stories only, never hand-typed.
async function artistPage(slug: string): Promise<ArtistBundle | null> {
  const bundle = await getArtist(slug)
  if (!bundle) return null
  return { ...bundle, obras: bundle.obras.filter((obra) => obra.story_status === 'published') }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  if (!isConfigured()) return { title: 'Destapando el Arte' }
  const { slug } = await props.params
  const bundle = await artistPage(slug)
  if (!bundle) return { title: 'Artista no encontrado — Destapando el Arte' }
  return {
    title: `${bundle.artist.name} — Destapando el Arte`,
    description: bundle.artist.why_special ?? bundle.artist.bio ?? undefined,
  }
}

export default async function Page(props: Props) {
  if (!isConfigured()) return <SetupNotice />
  const { slug } = await props.params
  const bundle = await artistPage(slug)
  if (!bundle) notFound()

  const { artist, obras } = bundle
  const years = [artist.born_year, artist.died_year].filter(Boolean).join(' – ')

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Destapando el Arte
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{artist.name}</h1>
        {years ? <p className="mt-1 text-zinc-600">{years}</p> : null}
      </header>

      {artist.why_special ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Por qué es especial</h2>
          <p className="mt-2 leading-7 text-zinc-800">{artist.why_special}</p>
        </section>
      ) : null}

      {artist.bio ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Su historia</h2>
          <p className="mt-2 whitespace-pre-line leading-7 text-zinc-800">{artist.bio}</p>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Obras</h2>
        {obras.length > 0 ? (
          <ul className="mt-3 divide-y divide-zinc-200">
            {obras.map((obra) => (
              <li key={obra.id}>
                <Link
                  className="flex items-baseline justify-between gap-4 py-3 hover:underline"
                  href={`/obra/${obra.slug}`}
                >
                  <span className="font-medium">{obra.title_es}</span>
                  {obra.year ? <span className="text-sm text-zinc-600">{obra.year}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Aún no hay obras publicadas de {artist.name} — la primera llegará pronto.
          </p>
        )}
      </section>

      {artist.episode_youtube_id ? (
        <a
          className="mt-10 inline-block rounded-md bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800"
          href={`https://www.youtube.com/watch?v=${artist.episode_youtube_id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          ▶ Ver el episodio
        </a>
      ) : null}

      <section className="mt-10 rounded-xl bg-zinc-100 p-6">
        <h2 className="text-sm font-semibold">¿Buscas una obra de {artist.name}?</h2>
        <form action={createRequest} className="mt-3 flex gap-2">
          <input type="hidden" name="artist_slug" value={artist.slug} />
          <input type="hidden" name="artist_id" value={artist.id} />
          <input
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            name="label"
            placeholder="Dinos cuál y la destapamos"
            required
          />
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
            Avísame
          </button>
        </form>
      </section>

      <p className="mt-10 text-center text-xs text-zinc-400">
        <a className="underline hover:text-zinc-600" href="/privacidad">
          Privacidad
        </a>
      </p>
    </main>
  )
}

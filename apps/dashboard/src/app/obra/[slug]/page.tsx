import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createRequest } from '@/lib/actions'
import { get } from '@/lib/artworks'
import { isConfigured } from '@/lib/supabase-server'
import { CuriosityBadge } from '@/components/badges'
import { SetupNotice } from '@/components/setup-notice'

export const dynamic = 'force-dynamic'

type Props = PageProps<'/obra/[slug]'>

// Public truth gate — the query-side mirror of the RLS policy: only published
// works exist at /obra/*. Everything else is a 404.
async function published(slug: string) {
  const bundle = await get(slug)
  if (!bundle || bundle.artwork.story_status !== 'published') return null
  return bundle
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  if (!isConfigured()) return { title: 'Destapando el Arte' }
  const { slug } = await props.params
  const bundle = await published(slug)
  if (!bundle) return { title: 'Obra no encontrada — Destapando el Arte' }
  return {
    title: `${bundle.artwork.title_es} — Destapando el Arte`,
    description: bundle.artwork.summary ?? bundle.artwork.why_it_matters ?? undefined,
  }
}

export default async function Page(props: Props) {
  if (!isConfigured()) return <SetupNotice />
  const { slug } = await props.params
  const bundle = await published(slug)
  if (!bundle) notFound()

  const { artwork, curiosities, connections } = bundle
  const artistName = artwork.artists?.name

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Destapando el Arte
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{artwork.title_es}</h1>
        <p className="mt-1 text-zinc-600">
          {artistName}
          {artwork.year ? ` · ${artwork.year}` : ''}
        </p>
      </header>

      {artwork.summary ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">¿Qué es?</h2>
          <p className="mt-2 leading-7 text-zinc-800">{artwork.summary}</p>
        </section>
      ) : null}

      {artwork.why_it_matters ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">¿Por qué importa?</h2>
          <p className="mt-2 leading-7 text-zinc-800">{artwork.why_it_matters}</p>
        </section>
      ) : null}

      {curiosities.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Curiosidades que nadie te cuenta</h2>
          <ul className="mt-3 space-y-4">
            {curiosities.map((curiosity) => (
              <li key={curiosity.id} className="rounded-lg border border-zinc-200 p-4">
                <CuriosityBadge type={curiosity.type} />
                <p className="mt-2 leading-7 text-zinc-800">{curiosity.text}</p>
                <a
                  className="mt-2 inline-block text-xs text-sky-700 underline"
                  href={curiosity.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  fuente
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {connections.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">El cine que tomó prestado su lenguaje</h2>
          <ul className="mt-3 space-y-4">
            {connections.map((connection) => (
              <li key={connection.id} className="rounded-lg border border-zinc-200 p-4">
                <p className="font-medium">
                  {connection.films?.title}
                  {connection.films?.year ? ` (${connection.films.year})` : ''}
                  {connection.films?.director ? ` — dir. ${connection.films.director}` : ''}
                </p>
                <p className="mt-1 text-sm text-zinc-600">{connection.what_it_borrowed}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-800">
                  {connection.frame_analysis_text}
                </p>
                {connection.evidence_url && connection.evidence_visual !== 'none' ? (
                  <a
                    className="mt-2 inline-block text-xs text-sky-700 underline"
                    href={connection.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ver la escena
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {artwork.essay ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">La historia completa</h2>
          <p className="mt-2 whitespace-pre-line leading-7 text-zinc-800">{artwork.essay}</p>
        </section>
      ) : null}

      {artwork.episode_youtube_id ? (
        <a
          className="mt-10 inline-block rounded-md bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800"
          href={`https://www.youtube.com/watch?v=${artwork.episode_youtube_id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          ▶ Ver el episodio
        </a>
      ) : null}

      <section className="mt-10 rounded-xl bg-zinc-100 p-6">
        <h2 className="text-sm font-semibold">¿Buscas otra obra{artistName ? ` de ${artistName}` : ''}?</h2>
        <form action={createRequest} className="mt-3 flex gap-2">
          <input type="hidden" name="slug" value={artwork.slug} />
          <input type="hidden" name="artist_id" value={artwork.artist_id ?? ''} />
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
    </main>
  )
}

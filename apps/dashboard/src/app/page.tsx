import Link from 'next/link'
import { list } from '@/lib/artworks'
import { isConfigured } from '@/lib/supabase-server'
import { RightsBadge, StatusBadge } from '@/components/badges'
import { SetupNotice } from '@/components/setup-notice'

export const dynamic = 'force-dynamic'

export default async function Home() {
  if (!isConfigured()) return <SetupNotice />
  const rows = await list()

  const published = rows.filter((row) => row.story_status === 'published').length

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Catálogo</h1>
        <p className="text-sm text-zinc-500">
          {published}/{rows.length} publicadas · Phase 3 gate: ≥ 50 (ADR-0012)
        </p>
      </header>

      <table className="mt-8 w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="py-2">Obra</th>
            <th className="py-2">Artista</th>
            <th className="py-2">Estado</th>
            <th className="py-2">Banderas</th>
            <th className="py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="py-3 font-medium">
                {row.title_es}
                <span className="ml-2 text-xs text-zinc-400">{row.year}</span>
              </td>
              <td className="py-3 text-zinc-600">{row.artists?.name ?? '—'}</td>
              <td className="py-3"><StatusBadge status={row.story_status} /></td>
              <td className="py-3">
                <div className="flex gap-1.5">
                  <RightsBadge status={row.rights_status} />
                  {row.indexed ? (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                      indexada
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="py-3 text-right">
                <Link className="font-medium text-zinc-900 underline" href={`/cuadro/${row.slug}`}>
                  editar
                </Link>
                {row.story_status === 'published' ? (
                  <>
                    <span className="mx-1 text-zinc-300">·</span>
                    <Link className="font-medium text-zinc-900 underline" href={`/obra/${row.slug}`}>
                      ver
                    </Link>
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

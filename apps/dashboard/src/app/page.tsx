import { list } from '@/lib/artworks'
import { isConfigured } from '@/lib/supabase-server'
import { IndexedBadge, RightsBadge, StatusBadge } from '@/components/badges'
import { SetupNotice } from '@/components/setup-notice'
import { ButtonLink } from '@/components/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

// Glossary "readiness gates": the four Phase-3 triggers, dashboard-visible.
// Only the catalog gate has live data today — the rest say so honestly.
const PENDING_GATES: readonly { title: string; target: string }[] = [
  { title: 'Vectores', target: '100 % del corpus escaneable' },
  { title: 'Instalaciones', target: '≥ 500' },
  { title: 'Retención D7', target: '≥ 15 %' },
]

export default async function Home() {
  if (!isConfigured()) return <SetupNotice />
  const rows = await list()

  const published = rows.filter((row) => row.story_status === 'published').length

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold">Catálogo</h1>
        <p className="text-sm text-muted-foreground">
          {published}/{rows.length} publicadas · puertas de Fase 3 (ADR-0012)
        </p>
      </header>

      <section aria-label="Puertas de Fase 3" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catálogo publicado
            </CardTitle>
            <CardDescription>≥ 50 publicadas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {published}
              <span className="text-base font-normal text-muted-foreground">/50</span>
            </p>
          </CardContent>
        </Card>
        {PENDING_GATES.map((gate) => (
          <Card key={gate.title} className="opacity-75">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {gate.title}
              </CardTitle>
              <CardDescription>{gate.target}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums text-muted-foreground">—</p>
              <p className="mt-1 text-xs text-muted-foreground">sin datos aún</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="mt-8 gap-0 py-0">
        <Table className="[&_th]:h-11 [&_th]:px-4 [&_td]:px-4 [&_td]:py-3">
          <TableHeader>
            <TableRow>
              <TableHead>Obra</TableHead>
              <TableHead>Artista</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Banderas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  El catálogo está vacío — ejecuta supabase/seed.sql.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.title_es}
                    <span className="ml-2 text-xs text-muted-foreground">{row.year}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.artists?.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.story_status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <RightsBadge status={row.rights_status} />
                      {row.indexed ? <IndexedBadge /> : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ButtonLink variant="link" size="sm" href={`/cuadro/${row.slug}`}>
                        editar
                      </ButtonLink>
                      {row.story_status === 'published' ? (
                        <ButtonLink
                          variant="link"
                          size="sm"
                          href={`/obra/${row.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          ver ↗
                        </ButtonLink>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </main>
  )
}

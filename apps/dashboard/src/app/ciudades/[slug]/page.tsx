import { notFound } from 'next/navigation'
import { getCity } from '@/lib/cities'
import { isConfigured } from '@/lib/supabase-server'
import { SetupNotice } from '@/components/setup-notice'
import { ButtonLink } from '@/components/button-link'
import { CityForm } from '@/components/editor/city-form'
import { PlacesEditor } from '@/components/editor/places-editor'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const dynamic = 'force-dynamic'

// The Tablero's city editor (ADR-0024): hand fields + curated Lugares. The
// derived «Obras aquí» list is read-only context — it grows as the catalog
// publishes obras with a physical_instance in this city. No public /ciudad
// page exists in v1 (ADR-0024): this editor and the mobile tab are the only
// surfaces.
export default async function Page(props: PageProps<'/ciudades/[slug]'>) {
  if (!isConfigured()) return <SetupNotice />
  const { slug } = await props.params
  const bundle = await getCity(slug)
  if (!bundle) notFound()

  const { city, places, obras } = bundle

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-12">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <ButtonLink variant="link" size="sm" href="/ciudades">
            ← ciudades
          </ButtonLink>
        </div>
        <h1 className="text-2xl font-semibold">{city.name}</h1>
        <p className="text-muted-foreground">
          {places.length} {places.length === 1 ? 'lugar' : 'lugares'} ·{' '}
          {obras.length}{' '}
          {obras.length === 1 ? 'obra publicada aquí' : 'obras publicadas aquí'}
        </p>
      </header>

      <CityForm city={city} />
      <PlacesEditor cityId={city.id} citySlug={city.slug} places={places} />

      {obras.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Obras aquí — derivado</CardTitle>
            <CardDescription>
              Obras publicadas del catálogo con una instancia física en{' '}
              {city.name} (ADR-0024). No se edita aquí: crece con el catálogo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {obras.map((obra) => (
                <li
                  key={obra.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{obra.title_es}</span>
                    {obra.year ? (
                      <span className="text-xs text-muted-foreground">{obra.year}</span>
                    ) : null}
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

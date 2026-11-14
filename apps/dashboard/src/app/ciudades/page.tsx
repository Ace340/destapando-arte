import { listCities } from '@/lib/cities'
import { saveCity } from '@/lib/actions'
import { isConfigured } from '@/lib/supabase-server'
import { SetupNotice } from '@/components/setup-notice'
import { ButtonLink } from '@/components/button-link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const dynamic = 'force-dynamic'

const caption = 'text-xs font-medium uppercase tracking-wide text-muted-foreground'

// Las Ciudades (ADR-0024): the Tablero's city index. Rows are Cards —
// creation is the listing gate, so the row IS the published state; the
// counts separate the curated Lugares from the derived «Obras aquí».
export default async function Page() {
  if (!isConfigured()) return <SetupNotice />
  const cities = await listCities()

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-12">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <ButtonLink variant="link" size="sm" href="/">
            ← catálogo
          </ButtonLink>
        </div>
        <h1 className="text-2xl font-semibold">Ciudades</h1>
        <p className="text-muted-foreground">
          La capa de ciudad (ADR-0024): se crean a mano — crear es publicar.
          Los lugares se curan aquí; las obras aquí se derivan del catálogo.
        </p>
      </header>

      {cities.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground">
            No hay ciudades todavía — crea la primera abajo.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {cities.map((city) => (
            <li key={city.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{city.name}</p>
                    <p className="text-muted-foreground">
                      {city.places.length}{' '}
                      {city.places.length === 1 ? 'lugar' : 'lugares'} ·{' '}
                      {city.publishedObras}{' '}
                      {city.publishedObras === 1
                        ? 'obra publicada aquí'
                        : 'obras publicadas aquí'}
                    </p>
                  </div>
                  <ButtonLink variant="link" size="sm" href={`/ciudades/${city.slug}`}>
                    editar
                  </ButtonLink>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nueva ciudad</CardTitle>
          <CardDescription>
            Crear es publicar (ADR-0024): la ciudad aparece en la app al
            guardarse. El slug se deriva del nombre; la posición vacía la añade
            al final.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveCity} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1.5">
                <Label className={caption} htmlFor="new-city-name">
                  Nombre
                </Label>
                <Input id="new-city-name" name="name" placeholder="Arles" required />
              </div>
              <div className="space-y-1.5">
                <Label className={caption} htmlFor="new-city-position">
                  Posición (vacío = al final)
                </Label>
                <Input
                  id="new-city-position"
                  name="position"
                  type="number"
                  className="w-24"
                />
              </div>
            </div>
            <Button type="submit">Crear ciudad</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

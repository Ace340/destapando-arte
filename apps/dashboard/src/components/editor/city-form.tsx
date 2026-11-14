import { removeCity, saveCity } from '@/lib/actions'
import { previewUrl } from '@/lib/image-url'
import type { City } from '@/lib/types'
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
import { Textarea } from '@/components/ui/textarea'

const caption = 'text-xs font-medium uppercase tracking-wide text-muted-foreground'

// ADR-0024 + ADR-0008: a Ciudad is hand-created — name, hand order, and an
// optional picture linked to Commons (never hosted). The slug is derived at
// creation and stays fixed (the app links by it), so it is not editable here.
export function CityForm({ city }: { city: City }) {
  const preview = previewUrl(city.image_url ?? '')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">La ciudad — nombre, orden e imagen</CardTitle>
        <CardDescription>
          La posición fija la fila en la pestaña Ciudades de la app. El slug se
          fija al crear y no cambia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={saveCity} className="space-y-4">
          <input type="hidden" name="slug" value={city.slug} />
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="city-name">
                Nombre
              </Label>
              <Input id="city-name" name="name" defaultValue={city.name} required />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="city-position">
                Posición
              </Label>
              <Input
                id="city-position"
                name="position"
                type="number"
                defaultValue={city.position}
                className="w-24"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className={caption} htmlFor="city-image-url">
              Imagen — página de archivo de Commons (opcional)
            </Label>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- Commons 302s to the thumb; the optimizer must not proxy big scans
              <img
                src={preview}
                alt={`Imagen de ${city.name}`}
                className="max-h-48 w-full rounded-md object-cover"
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                Sin imagen — la app muestra la inicial de la ciudad como
                marcador.
              </p>
            )}
            <Input
              id="city-image-url"
              name="image_url"
              type="url"
              defaultValue={city.image_url ?? ''}
              placeholder="https://commons.wikimedia.org/wiki/File:…"
            />
          </div>
          <div className="space-y-1.5">
            <Label className={caption} htmlFor="city-story">
              Historia — un párrafo breve (opcional)
            </Label>
            <Textarea
              id="city-story"
              name="story"
              rows={4}
              defaultValue={city.story ?? ''}
              placeholder={`Ej.: ${city.name} guarda secretos en cada rincón y es un epicentro artístico mundial…`}
            />
            <p className="text-xs text-muted-foreground">
              Voz narrativa, sin datos inventados. Vacío = la app no muestra
              ninguna sección de historia.
            </p>
          </div>
          <Button type="submit">Guardar ciudad</Button>
        </form>

        <form action={removeCity} className="border-t border-border pt-4">
          <input type="hidden" name="slug" value={city.slug} />
          <Button type="submit" variant="destructive" size="sm">
            Eliminar ciudad
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Elimina la ciudad y todos sus lugares — irreversible.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

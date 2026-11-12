import { removePlace, savePlace } from '@/lib/actions'
import type { CityPlace } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

const caption = 'text-xs font-medium uppercase tracking-wide text-muted-foreground'

// One Lugar (GLOSSARY, ADR-0024): inline edit form + quitar — the same
// two-forms-per-row model the images editor uses.
function PlaceRow({
  place,
  cityId,
  citySlug,
}: {
  place: CityPlace
  cityId: string
  citySlug: string
}) {
  return (
    <li className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <form action={savePlace} className="min-w-0 flex-1 space-y-3">
          <input type="hidden" name="city_id" value={cityId} />
          <input type="hidden" name="city_slug" value={citySlug} />
          <input type="hidden" name="place_id" value={place.id} />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label className={caption} htmlFor={`place-name-${place.id}`}>
                Nombre
              </Label>
              <Input
                id={`place-name-${place.id}`}
                name="name"
                defaultValue={place.name}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor={`place-position-${place.id}`}>
                Posición
              </Label>
              <Input
                id={`place-position-${place.id}`}
                name="position"
                type="number"
                defaultValue={place.position}
                className="w-24"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className={caption} htmlFor={`place-note-${place.id}`}>
              Nota (opcional)
            </Label>
            <Input
              id={`place-note-${place.id}`}
              name="note"
              defaultValue={place.note ?? ''}
              placeholder="Una frase sobre por qué importa"
            />
          </div>
          <div className="space-y-1.5">
            <Label className={caption} htmlFor={`place-url-${place.id}`}>
              URL (opcional, verificada — ADR-0014)
            </Label>
            <Input
              id={`place-url-${place.id}`}
              name="url"
              type="url"
              defaultValue={place.url ?? ''}
              placeholder="https://…"
            />
          </div>
          <Button type="submit" size="sm">
            Guardar lugar
          </Button>
        </form>
        <form action={removePlace}>
          <input type="hidden" name="id" value={place.id} />
          <input type="hidden" name="city_slug" value={citySlug} />
          <Button type="submit" variant="destructive" size="xs">
            quitar
          </Button>
        </form>
      </div>
    </li>
  )
}

// The curated Lugares list (ADR-0024): museums and galleries that matter,
// even those holding no catalog obra. Append form rides below the rows.
export function PlacesEditor({
  cityId,
  citySlug,
  places,
}: {
  cityId: string
  citySlug: string
  places: CityPlace[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lugares</CardTitle>
        <CardDescription>
          La lista curada a mano: los museos y galerías que importan en la
          ciudad — pueden no tener obra del catálogo. La URL es opcional y solo
          se guarda cuando está verificada (ADR-0014).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {places.length === 0 ? (
          <p className="text-muted-foreground">
            Sin lugares todavía — añade el primero abajo.
          </p>
        ) : (
          <ul className="space-y-3">
            {places.map((place) => (
              <PlaceRow
                key={place.id}
                place={place}
                cityId={cityId}
                citySlug={citySlug}
              />
            ))}
          </ul>
        )}

        <form
          action={savePlace}
          className="mt-6 space-y-3 border-t border-border pt-6"
        >
          <input type="hidden" name="city_id" value={cityId} />
          <input type="hidden" name="city_slug" value={citySlug} />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="new-place-name">
                Nombre (obligatorio)
              </Label>
              <Input
                id="new-place-name"
                name="name"
                placeholder="Museo de Arte Moderno"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="new-place-position">
                Posición (vacío = al final)
              </Label>
              <Input
                id="new-place-position"
                name="position"
                type="number"
                className="w-24"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className={caption} htmlFor="new-place-note">
              Nota (opcional)
            </Label>
            <Input
              id="new-place-note"
              name="note"
              placeholder="Una frase sobre por qué importa"
            />
          </div>
          <div className="space-y-1.5">
            <Label className={caption} htmlFor="new-place-url">
              URL (opcional, verificada — ADR-0014)
            </Label>
            <Input
              id="new-place-url"
              name="url"
              type="url"
              placeholder="https://…"
            />
          </div>
          <Alert>
            <AlertTitle>Las posiciones son únicas por ciudad</AlertTitle>
            <AlertDescription>
              Una posición vacía añade el lugar al final; un número que ya
              ocupa otro lugar lo rechaza la base de datos — elige otro número
              o reordena los demás lugares primero.
            </AlertDescription>
          </Alert>
          <Button type="submit">Añadir lugar</Button>
        </form>
      </CardContent>
    </Card>
  )
}

import { removeCity, saveCity } from '@/lib/actions'
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

const caption = 'text-xs font-medium uppercase tracking-wide text-muted-foreground'

// ADR-0024: a Ciudad is hand-created — name and hand order are its only
// fields. The slug is derived at creation and stays fixed (the app links
// by it), so it is not editable here.
export function CityForm({ city }: { city: City }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">La ciudad — nombre y orden</CardTitle>
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

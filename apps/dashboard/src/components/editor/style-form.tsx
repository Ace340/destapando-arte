import { saveStyle } from '@/lib/actions'
import type { Artwork, Style } from '@/lib/types'
import { NativeSelect } from '@/components/native-select'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const caption = 'text-xs font-medium uppercase tracking-wide text-muted-foreground'

// ADR-0025: one obra, one style — the dominant one, or nothing until the
// editor sets it. The select lists the seeded taxonomy (lib/styles);
// empty keeps the work unclassified, where the dev-time «Sin clasificar»
// chip in the app's Estilos strip shows it.
export function StyleForm({ artwork, styles }: { artwork: Artwork; styles: Style[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estilo</CardTitle>
        <CardDescription>La clasificación de la obra — un estilo por obra.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveStyle} className="space-y-4">
          <input type="hidden" name="slug" value={artwork.slug} />

          <div className="space-y-1.5">
            <Label className={caption} htmlFor="style_id">
              Estilo de la obra
            </Label>
            <NativeSelect id="style_id" name="style_id" defaultValue={artwork.style_id ?? ''}>
              <option value="">Sin clasificar</option>
              {styles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <Button type="submit">Guardar estilo</Button>
        </form>
      </CardContent>
    </Card>
  )
}

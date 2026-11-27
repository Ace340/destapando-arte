import { saveStyle } from '@/lib/actions'
import type { Artwork, Style } from '@/lib/types'
import { StylePicker } from '@/components/editor/style-picker'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// ADR-0025: one obra, one style — the dominant one, or nothing until the
// editor sets it. StylePicker (the only client island here) renders the
// grouped select plus the chosen style's description; empty keeps the work
// unclassified, where the dev-time «Sin clasificar» chip in the app's
// Estilos strip shows it.
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

          <StylePicker styles={styles} defaultValue={artwork.style_id ?? ''} />

          <Button type="submit">Guardar estilo</Button>
        </form>
      </CardContent>
    </Card>
  )
}

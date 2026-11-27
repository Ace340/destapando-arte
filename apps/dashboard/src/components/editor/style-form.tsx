import type { Artwork, Style } from '@/lib/types'
import { StylePicker } from '@/components/editor/style-picker'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// ADR-0025: one obra, one style — the dominant one, or nothing until the
// editor sets it. StyleForm is the server shell; StylePicker (the client
// island inside the card) owns the grouped select, the description help
// line and the save confirmation; empty keeps the work unclassified, where
// the dev-time «Sin clasificar» chip in the app's Estilos strip shows it.
export function StyleForm({ artwork, styles }: { artwork: Artwork; styles: Style[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estilo</CardTitle>
        <CardDescription>La clasificación de la obra — un estilo por obra.</CardDescription>
      </CardHeader>
      <CardContent>
        <StylePicker slug={artwork.slug} styles={styles} defaultStyleId={artwork.style_id ?? ''} />
      </CardContent>
    </Card>
  )
}

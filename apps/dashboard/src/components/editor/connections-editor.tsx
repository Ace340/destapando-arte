import { removeConnection, saveConnection } from '@/lib/actions'
import { NativeSelect } from '@/components/native-select'
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
import type { ConnectionRow } from '@/lib/artworks'

const caption = 'text-xs font-medium uppercase tracking-wide text-muted-foreground'

export function ConnectionsEditor({
  artworkId,
  slug,
  connections,
}: {
  artworkId: string
  slug: string
  connections: ConnectionRow[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Conexiones cinematográficas — el foso (moat)</CardTitle>
        <CardDescription>
          ADR-0014: el análisis de plano es obligatorio — ninguna afirmación
          descansa en un enlace que no controlamos. El embed es adorno.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {connections.map((connection) => (
            <li key={connection.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {connection.films?.title}
                    {connection.films?.year ? ` (${connection.films.year})` : ''}
                    {connection.films?.director ? ` — ${connection.films.director}` : ''}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {connection.what_it_borrowed}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{connection.mechanism}</p>
                </div>
                <form action={removeConnection}>
                  <input type="hidden" name="id" value={connection.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <Button type="submit" variant="destructive" size="xs">
                    quitar
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <form
          action={saveConnection}
          className="mt-6 space-y-3 border-t border-border pt-6"
        >
          <input type="hidden" name="artwork_id" value={artworkId} />
          <input type="hidden" name="slug" value={slug} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="film-title">
                Película
              </Label>
              <Input id="film-title" name="film_title" required />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="film-year">
                Año
              </Label>
              <Input id="film-year" name="film_year" type="number" />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="film-director">
                Director
              </Label>
              <Input id="film-director" name="film_director" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="what-borrowed">
                Qué tomó prestado
              </Label>
              <Input
                id="what-borrowed"
                name="what_it_borrowed"
                placeholder="la luz, el encuadre, la paleta…"
              />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="evidence-visual">
                Evidencia visual
              </Label>
              <NativeSelect
                id="evidence-visual"
                name="evidence_visual"
                defaultValue="none"
              >
                <option value="none">ninguna</option>
                <option value="our_diagram">nuestro diagrama</option>
                <option value="youtube_embed">embed de YouTube</option>
                <option value="both">ambos</option>
              </NativeSelect>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className={caption} htmlFor="mechanism">
              Mecanismo — la afirmación concreta
            </Label>
            <Input id="mechanism" name="mechanism" />
          </div>
          <div className="space-y-1.5">
            <Label className={caption} htmlFor="frame-analysis">
              Análisis de plano (obligatorio, ADR-0014)
            </Label>
            <Textarea
              id="frame-analysis"
              name="frame_analysis_text"
              rows={3}
              required
              placeholder="Reconstrucción escrita del plano: composición, dirección de la luz, geometría…"
            />
          </div>
          <div className="space-y-1.5">
            <Label className={caption} htmlFor="evidence-url">
              URL de evidencia (adorno)
            </Label>
            <Input id="evidence-url" name="evidence_url" type="url" />
          </div>
          <Button type="submit">Añadir conexión</Button>
        </form>
      </CardContent>
    </Card>
  )
}

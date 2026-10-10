import { saveBeats } from '@/lib/actions'
import type { Artwork } from '@/lib/types'
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

export function BeatsForm({ artwork }: { artwork: Artwork }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">La historia — cuatro beats</CardTitle>
        <CardDescription>
          Resumen, por qué importa, curiosidades y conexiones — el ensayo es la
          única escapatoria libre.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveBeats} className="space-y-4">
          <input type="hidden" name="slug" value={artwork.slug} />

          <div className="space-y-1.5">
            <Label className={caption} htmlFor="summary">
              Resumen — qué es
            </Label>
            <Textarea id="summary" name="summary" rows={3} defaultValue={artwork.summary ?? ''} />
          </div>

          <div className="space-y-1.5">
            <Label className={caption} htmlFor="why_it_matters">
              Por qué importa — el argumento (2–3 frases, obligatorio)
            </Label>
            <Textarea
              id="why_it_matters"
              name="why_it_matters"
              rows={3}
              defaultValue={artwork.why_it_matters ?? ''}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={caption} htmlFor="essay">
              Ensayo — la única escapatoria libre (opcional)
            </Label>
            <Textarea id="essay" name="essay" rows={5} defaultValue={artwork.essay ?? ''} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="source_transcript">
                Transcripción fuente (ADR-0013: sin transcripción no hay descuento)
              </Label>
              <Textarea
                id="source_transcript"
                name="source_transcript"
                rows={3}
                defaultValue={artwork.source_transcript ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="episode_youtube_id">
                Episodio (YouTube ID)
              </Label>
              <Input
                id="episode_youtube_id"
                name="episode_youtube_id"
                defaultValue={artwork.episode_youtube_id ?? ''}
                placeholder="dQw4w9WgXcQ"
              />
            </div>
          </div>

          <Button type="submit">Guardar beats</Button>
        </form>
      </CardContent>
    </Card>
  )
}

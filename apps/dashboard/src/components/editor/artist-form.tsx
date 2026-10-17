import { saveArtist } from '@/lib/actions'
import type { Artist } from '@/lib/types'
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

// ADR-0022: hook + Bio. The hook is the artist page's face; the Bio is
// optional enrichment added progressively — never a launch gate.
export function ArtistForm({ artist }: { artist: Artist }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">El artista — gancho y biografía</CardTitle>
        <CardDescription>
          El gancho (why_special, 3–5 frases) hace editorial la página; la
          biografía corta es enriquecimiento opcional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveArtist} className="space-y-4">
          <input type="hidden" name="slug" value={artist.slug} />

          <div className="space-y-1.5">
            <Label className={caption} htmlFor="why_special">
              Gancho — por qué es especial (3–5 frases)
            </Label>
            <Textarea
              id="why_special"
              name="why_special"
              rows={3}
              defaultValue={artist.why_special ?? ''}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={caption} htmlFor="bio">
              Biografía — su historia (opcional, corta)
            </Label>
            <Textarea id="bio" name="bio" rows={5} defaultValue={artist.bio ?? ''} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="born_year">
                Nacimiento (año)
              </Label>
              <Input
                id="born_year"
                name="born_year"
                type="number"
                defaultValue={artist.born_year ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="died_year">
                Fallecimiento (año)
              </Label>
              <Input
                id="died_year"
                name="died_year"
                type="number"
                defaultValue={artist.died_year ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="episode_youtube_id">
                Episodio (YouTube ID)
              </Label>
              <Input
                id="episode_youtube_id"
                name="episode_youtube_id"
                defaultValue={artist.episode_youtube_id ?? ''}
                placeholder="dQw4w9WgXcQ"
              />
            </div>
          </div>

          <Button type="submit">Guardar artista</Button>
        </form>
      </CardContent>
    </Card>
  )
}

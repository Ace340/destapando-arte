import { createCuriosity, removeCuriosity } from '@/lib/actions'
import { CuriosityBadge } from '@/components/badges'
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
import type { Curiosity } from '@/lib/types'

const caption = 'text-xs font-medium uppercase tracking-wide text-muted-foreground'

export function CuriositiesEditor({
  artworkId,
  slug,
  curiosities,
}: {
  artworkId: string
  slug: string
  curiosities: Curiosity[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Curiosidades — tipadas y con fuente (ADR-0007)</CardTitle>
        <CardDescription>
          Sin fuente no hay curiosidad. «Mito destapado» es el contenido premium:
          la leyenda dice X, la evidencia dice Y.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {curiosities.map((curiosity) => (
            <li key={curiosity.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CuriosityBadge type={curiosity.type} />
                  <p className="mt-2 text-sm">{curiosity.text}</p>
                  <a
                    className="mt-1 inline-block text-xs text-primary underline underline-offset-4"
                    href={curiosity.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    fuente: {curiosity.source_note ?? curiosity.source_url}
                  </a>
                </div>
                <form action={removeCuriosity}>
                  <input type="hidden" name="id" value={curiosity.id} />
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
          action={createCuriosity}
          className="mt-6 space-y-3 border-t border-border pt-6"
        >
          <input type="hidden" name="artwork_id" value={artworkId} />
          <input type="hidden" name="slug" value={slug} />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="curiosity-text">
                Nueva curiosidad
              </Label>
              <Textarea id="curiosity-text" name="text" rows={2} required />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="curiosity-type">
                Tipo
              </Label>
              <NativeSelect id="curiosity-type" name="type" defaultValue="fact">
                <option value="fact">dato</option>
                <option value="myth">mito destapado</option>
                <option value="legend">leyenda</option>
              </NativeSelect>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="curiosity-source">
                Fuente (URL, obligatoria)
              </Label>
              <Input id="curiosity-source" name="source_url" type="url" required />
            </div>
            <div className="space-y-1.5">
              <Label className={caption} htmlFor="curiosity-note">
                Nota de fuente
              </Label>
              <Input id="curiosity-note" name="source_note" />
            </div>
          </div>
          <Button type="submit">Añadir curiosidad</Button>
        </form>
      </CardContent>
    </Card>
  )
}

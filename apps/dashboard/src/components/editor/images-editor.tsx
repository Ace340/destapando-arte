import { removeImage, saveImage } from '@/lib/actions'
import { previewUrl } from '@/lib/image-url'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
import { NativeSelect } from '@/components/native-select'
import type { ImageAsset } from '@/lib/types'

const caption = 'text-xs font-medium uppercase tracking-wide text-muted-foreground'

function AssetRow({ image, slug }: { image: ImageAsset; slug: string }) {
  const preview = previewUrl(image.source_url)
  return (
    <li className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {image.kind === 'display' && preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- Commons 302s to the thumb; the optimizer must not proxy ~30k-px scans
            <img
              src={preview}
              alt={image.credit ?? 'imagen de la obra'}
              className="mb-3 max-h-64 w-full rounded-md object-contain"
            />
          ) : null}
          <Badge variant={image.kind === 'display' ? 'default' : 'secondary'}>
            {image.kind === 'display' ? 'display' : 'referencia'}
          </Badge>
          <p className="mt-2 text-sm">{image.credit}</p>
          <a
            className="mt-1 inline-block text-xs text-primary underline underline-offset-4"
            href={image.source_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            fuente: {image.source_url}
          </a>
        </div>
        <form action={removeImage}>
          <input type="hidden" name="id" value={image.id} />
          <input type="hidden" name="slug" value={slug} />
          <Button type="submit" variant="destructive" size="xs">
            quitar
          </Button>
        </form>
      </div>
    </li>
  )
}

export function ImagesEditor({
  artworkId,
  slug,
  images,
  blocked,
}: {
  artworkId: string
  slug: string
  images: ImageAsset[]
  blocked: boolean
}) {
  const display = images.filter((image) => image.kind === 'display')
  const references = images.filter((image) => image.kind === 'reference')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Imágenes — enlazadas, dominio público (ADR-0002/0008)</CardTitle>
        <CardDescription>
          La URL es la página de archivo de Commons (…/wiki/File:…); la vista
          previa y las apps la renderizan vía Special:FilePath. Alojamos
          únicamente dominio público o material propio, y el crédito es
          obligatorio (ADR-0016).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {blocked ? (
          <Alert>
            <AlertTitle>Obra bloqueada por derechos — solo historia (ADR-0003)</AlertTitle>
            <AlertDescription>
              Sin imágenes de ningún tipo: la base de datos ya rechazaría la
              inserción. La app móvil muestra el héroe de degradado de paleta.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <ul className="space-y-3">
              {[...display, ...references].map((image) => (
                <AssetRow key={image.id} image={image} slug={slug} />
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Referencias: {references.length}. El indexing exige ≥ 3 (ADR-0005).
            </p>

            <form
              action={saveImage}
              className="mt-6 space-y-3 border-t border-border pt-6"
            >
              <input type="hidden" name="artwork_id" value={artworkId} />
              <input type="hidden" name="slug" value={slug} />
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="space-y-1.5">
                  <Label className={caption} htmlFor="image-url">
                    Página de archivo de Commons (obligatoria)
                  </Label>
                  <Input
                    id="image-url"
                    name="source_url"
                    type="url"
                    placeholder="https://commons.wikimedia.org/wiki/File:…"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={caption} htmlFor="image-kind">
                    Tipo
                  </Label>
                  <NativeSelect id="image-kind" name="kind" defaultValue="display">
                    <option value="display">display (reemplaza la actual)</option>
                    <option value="reference">referencia</option>
                  </NativeSelect>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={caption} htmlFor="image-credit">
                  Crédito (obligatorio, ADR-0016)
                </Label>
                <Input
                  id="image-credit"
                  name="credit"
                  placeholder="Museo — Wikimedia Commons (dominio público)"
                  required
                />
              </div>
              <Button type="submit">Guardar imagen</Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}

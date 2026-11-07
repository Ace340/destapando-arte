// The derived Sello (GLOSSARY, ADR-0023): a circle of the artist's own art.
// Web mirror of apps/mobile/src/components/sello.tsx — public page, plain
// markup (ADR-0021 exempts public pages from shadcn). The palette gradient
// is the base and also the monogram fallback when resolveSello found no
// display image. Shows their art, never their face.

interface SelloProps {
  imageUrl: string | null
  palette: readonly string[]
  initials: string
  size?: number
}

// Same neutral base as the app's gradientStops (mobile lib/palette.ts):
// zinc-800 -> zinc-950, for artists whose obras carry no palette.
const NEUTRAL_STOPS = ['#27272A', '#09090B'] as const

// Mirror of the app's gradientStops (mobile lib/palette.ts): ≥2 stops for
// the gradient; empty palette resolves to the neutral base (zinc-800 ->
// zinc-950), a lone hex doubles itself.
function gradientCss(palette: readonly string[]): string {
  const stops =
    palette.length === 0
      ? [...NEUTRAL_STOPS]
      : palette.length === 1
        ? [palette[0], palette[0]]
        : [...palette]
  return `linear-gradient(135deg, ${stops.join(', ')})`
}

export function Sello({ imageUrl, palette, initials, size = 64 }: SelloProps) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background: imageUrl ? undefined : gradientCss(palette),
      }}
    >
      {imageUrl ? (
        // Plain <img> — no Commons domain configured for next/image; the
        // displayUrl thumbnail is already sized for this circle.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" width={size} height={size} className="h-full w-full object-cover" />
      ) : (
        <span
          className="font-semibold text-white/90"
          style={{ fontSize: size * 0.34, letterSpacing: 1 }}
        >
          {initials}
        </span>
      )}
    </span>
  )
}

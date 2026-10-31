import { ArtworkSurface } from '@/components/artwork-surface'
import { useTheme } from '@/lib/theme'

// Art-first catalog row (ADR-0020): the wall of paintings starts here.
// Same model as the Hero — palette gradient base, image on top when the
// work has one (story-only works show only their colors).

interface ArtworkThumbProps {
  source: string | null
  palette: readonly string[]
  slug: string
  size?: number
}

export function ArtworkThumb({ source, palette, slug, size = 72 }: ArtworkThumbProps) {
  const theme = useTheme()
  return (
    <ArtworkSurface
      source={source}
      palette={palette}
      recyclingKey={slug}
      style={{ width: size, height: size, borderRadius: 10, backgroundColor: theme.surface }}
    />
  )
}

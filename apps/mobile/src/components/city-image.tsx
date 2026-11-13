import {
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { ArtworkSurface } from '@/components/artwork-surface'
import { displayUrl } from '@/lib/image-url'

interface CityImageProps {
  imageUrl: string | null
  name: string
  width: number
  height: number
  radius?: number
  recyclingKey?: string
  /** Layout-only extras (margins) — size comes from width/height. */
  style?: StyleProp<ViewStyle>
}

// The city picture (ADR-0008): the editor-linked Commons image via the
// Special:FilePath transform, or the honest placeholder — a neutral-gradient
// tile with the city's initial (the Sello monogram model, ADR-0020/0023,
// minus the palette: a city carries no artwork palette, so gradientStops([])
// falls back to the neutral stops). Decorative in both surfaces — the city
// name is announced right beside it.
export function CityImage({
  imageUrl,
  name,
  width,
  height,
  radius = 12,
  recyclingKey,
  style,
}: CityImageProps) {
  const thumbWidth = Math.max(96, Math.round(Math.min(width, height) * 3))
  const source = imageUrl ? displayUrl(imageUrl, thumbWidth) : null

  return (
    <ArtworkSurface
      source={source}
      palette={[]}
      recyclingKey={recyclingKey}
      style={[styles.tile, { width, height, borderRadius: radius }, style]}
    >
      {source ? null : (
        <Text style={[styles.initial, { fontSize: Math.min(width, height) * 0.38 }]}>
          {name.slice(0, 1).toUpperCase()}
        </Text>
      )}
    </ArtworkSurface>
  )
}

const styles = StyleSheet.create({
  tile: {},
  initial: {
    fontFamily: 'Fraunces_600SemiBold',
    color: 'rgba(255,255,255,0.92)',
  },
})

import { StyleSheet, Text } from 'react-native'

import { ArtworkSurface } from '@/components/artwork-surface'

// The derived Sello (GLOSSARY, ADR-0023): the artist's own art. The palette
// gradient is the base through the shared ArtworkSurface model (ADR-0020) —
// also the monogram fallback when resolveSello found no display image. Shows
// their art, never their face. Circular on the Artist page header (`size`);
// the Artistas wall card supplies an explicit box with its own radius.

interface SelloProps {
  imageUrl: string | null
  palette: readonly string[]
  initials: string
  /** Square side of the circular mark — the default 44pt seal. */
  size?: number
  /** Explicit box for non-circle surfaces (the Artistas wall cards); overrides `size`. */
  width?: number
  height?: number
  /** Corner radius; defaults to a full circle. */
  radius?: number
  recyclingKey?: string
}

export function Sello({
  imageUrl,
  palette,
  initials,
  size = 44,
  width,
  height,
  radius,
  recyclingKey,
}: SelloProps) {
  const boxWidth = width ?? size
  const boxHeight = height ?? size
  const corner = radius ?? Math.min(boxWidth, boxHeight) / 2

  return (
    <ArtworkSurface
      source={imageUrl}
      palette={palette}
      recyclingKey={recyclingKey}
      style={[styles.mark, { width: boxWidth, height: boxHeight, borderRadius: corner }]}
    >
      {imageUrl ? null : (
        <Text style={[styles.initials, { fontSize: Math.min(boxWidth, boxHeight) * 0.34 }]}>
          {initials}
        </Text>
      )}
    </ArtworkSurface>
  )
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'Fraunces_600SemiBold',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 1,
  },
})

import { StyleSheet, Text } from 'react-native'

import { ArtworkSurface } from '@/components/artwork-surface'

// The derived Sello (GLOSSARY, ADR-0023): a circle of the artist's own art.
// The palette gradient is the base through the shared ArtworkSurface model
// (ADR-0020) — also the monogram fallback when resolveSello found no display
// image. Shows their art, never their face.

interface SelloProps {
  imageUrl: string | null
  palette: readonly string[]
  initials: string
  size?: number
  recyclingKey?: string
}

export function Sello({ imageUrl, palette, initials, size = 44, recyclingKey }: SelloProps) {
  return (
    <ArtworkSurface
      source={imageUrl}
      palette={palette}
      recyclingKey={recyclingKey}
      style={[styles.circle, { width: size, height: size }]}
    >
      {imageUrl ? null : <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{initials}</Text>}
    </ArtworkSurface>
  )
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'Fraunces_600SemiBold',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 1,
  },
})

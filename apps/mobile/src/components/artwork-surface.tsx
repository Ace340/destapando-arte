import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import type { ReactNode } from 'react'

import { gradientStops } from '@/lib/palette'

// The art-first surface model (ADR-0020, GLOSSARY Hero): the palette
// gradient is always the base layer — loading placeholder, and for
// story-only works (ADR-0003) the permanent image. The artwork image sits
// on top when there is one; anything passed as children renders above both.

interface ArtworkSurfaceProps {
  source: string | null
  palette: readonly string[]
  style?: StyleProp<ViewStyle>
  recyclingKey?: string
  transition?: number
  accessibilityLabel?: string
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  children?: ReactNode
}

export function ArtworkSurface({
  source,
  palette,
  style,
  recyclingKey,
  transition = 250,
  accessibilityLabel,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  children,
}: ArtworkSurfaceProps) {
  return (
    <View style={[styles.surface, style]}>
      <LinearGradient
        colors={gradientStops(palette) as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
        start={start}
        end={end}
      />
      {source ? (
        <Image
          source={{ uri: source }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          recyclingKey={recyclingKey}
          transition={transition}
          accessible={accessibilityLabel ? true : undefined}
          accessibilityLabel={accessibilityLabel}
        />
      ) : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  surface: {
    overflow: 'hidden',
  },
})

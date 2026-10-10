import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'

import { gradientStops } from '@/lib/palette'
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
    <View style={[styles.thumb, { width: size, height: size, backgroundColor: theme.surface }]}>
      <LinearGradient
        colors={gradientStops(palette) as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {source ? (
        <Image
          source={{ uri: source }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          recyclingKey={slug}
          transition={250}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  thumb: {
    borderRadius: 10,
    overflow: 'hidden',
  },
})

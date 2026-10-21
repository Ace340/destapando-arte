import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'

import { heroSource, type CatalogRow } from '@/lib/artworks'
import { gradientStops } from '@/lib/palette'
import { useTheme } from '@/lib/theme'

// The Apertura (GLOSSARY): the full-bleed card that opens the Catalog wall —
// and, at near-screen height, the shape of every card on the wall. Palette
// gradient base, image on top when the work has one (story-only works show
// only their colors), title and artist beneath. The floating "Descubre"
// header lives on the screen, not on the card.

export function AperturaCard({ artwork }: { artwork: CatalogRow }) {
  const theme = useTheme()
  const { height } = useWindowDimensions()
  const source = heroSource(artwork)
  const artist = artwork.artists?.name
  const imageHeight = Math.round(height * 0.72)

  return (
    <Link
      href={{ pathname: '/obra/[slug]', params: { slug: artwork.slug } }}
      asChild
    >
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={[styles.image, { height: imageHeight }]}>
          <LinearGradient
            colors={gradientStops(artwork.palette) as [string, string, ...string[]]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {source ? (
            <Image
              source={{ uri: source }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              recyclingKey={artwork.slug}
              transition={250}
            />
          ) : null}
        </View>
        <View style={styles.caption}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {artwork.title_es}
          </Text>
          <Text style={[styles.meta, { color: theme.muted }]}>
            {artist}
            {artwork.year ? ` · ${artwork.year}` : ''}
          </Text>
        </View>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  card: {
    // Full-bleed: the image runs edge to edge; only the caption is inset.
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    overflow: 'hidden',
  },
  caption: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 4,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
})

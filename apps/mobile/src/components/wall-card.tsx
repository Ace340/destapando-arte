import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { ArtworkSurface } from '@/components/artwork-surface'
import { heroSource, type CatalogRow } from '@/lib/artworks'
import { useTheme } from '@/lib/theme'

// A card on the Catalog wall (ADR-0020). The first card in the scroll is
// the Apertura (GLOSSARY) — every card shares its shape: a near-screen-
// height art surface (palette gradient base, image on top when the work
// has one; story-only works show only their colors, per the Hero fallback
// rule), title and artist beneath, tap to open the Story. The floating
// "Descubre" header lives on the screen, not on the card.

export function WallCard({ artwork }: { artwork: CatalogRow }) {
  const theme = useTheme()
  const { height } = useWindowDimensions()
  const source = heroSource(artwork)
  const imageHeight = Math.round(height * 0.72)

  return (
    <Link
      href={{ pathname: '/obra/[slug]', params: { slug: artwork.slug } }}
      asChild
    >
      <Pressable style={({ pressed }) => (pressed ? styles.pressed : null)}>
        <ArtworkSurface
          source={source}
          palette={artwork.palette}
          recyclingKey={artwork.slug}
          style={{ height: imageHeight }}
        />
        <View style={styles.caption}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {artwork.title_es}
          </Text>
          {artwork.artists?.name ? (
            <Text style={[styles.meta, { color: theme.muted }]}>{artwork.artists.name}</Text>
          ) : null}
        </View>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
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

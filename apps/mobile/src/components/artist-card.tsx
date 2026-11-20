import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { GUTTER } from '@/components/section-screen'
import { Sello } from '@/components/sello'
import { artistInitials, resolveSello, type ArtistListRow } from '@/lib/artists'
import { useTheme } from '@/lib/theme'

// A card on the Artistas scroll (ADR-0023, amended 2026-11-20): the wall
// shape the Ciudades cards took (bb0478b) — the Sello (the artist's own art,
// never a face) full-width within the scaffold's gutters at 0.36 of the
// screen height, radius 16, the name beneath in the wall's InstrumentSerif.
// No chevron, no separators: the caption's padding sets the rhythm.

export function ArtistCard({ artist }: { artist: ArtistListRow }) {
  const theme = useTheme()
  const { width, height } = useWindowDimensions()
  const imageWidth = Math.round(width - GUTTER * 2)
  const imageHeight = Math.round(height * 0.36)
  // The Sello source is derived in the card — no per-artist fetch. Same
  // thumb request CityImage makes: min side × 3 covers a ~3x screen.
  const thumbWidth = Math.max(96, Math.round(Math.min(imageWidth, imageHeight) * 3))
  const sello = resolveSello(artist.artworks, artist.sello_artwork_id, thumbWidth)

  return (
    <Link href={{ pathname: '/artista/[slug]', params: { slug: artist.slug } }} asChild>
      <Pressable style={({ pressed }) => (pressed ? styles.pressed : null)}>
        <Sello
          imageUrl={sello.imageUrl}
          palette={sello.palette}
          initials={artistInitials(artist.name)}
          width={imageWidth}
          height={imageHeight}
          radius={16}
          recyclingKey={artist.id}
        />
        <View style={styles.caption}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
            {artist.name}
          </Text>
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
    paddingTop: 12,
    paddingBottom: 32,
  },
  name: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 24,
  },
})

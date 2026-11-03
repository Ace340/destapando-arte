import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Sello } from '@/components/sello'
import { artistInitials, publishedCount, resolveSello, type ArtistListRow } from '@/lib/artists'
import { useTheme } from '@/lib/theme'

// Artist list row (ADR-0022) + the list separator, extracted from the
// Artistas route. The separator is a module-scope component so FlatList sees
// one stable type — an inline arrow remounts separators on every re-render.
// The Sello (ADR-0023) is derived in the row — no per-artist fetch.

export function ArtistRowItem({ artist }: { artist: ArtistListRow }) {
  const theme = useTheme()
  const count = publishedCount(artist)
  const years = [artist.born_year, artist.died_year].filter(Boolean).join(' – ')
  const meta = [years, `${count} ${count === 1 ? 'obra' : 'obras'}`].filter(Boolean).join(' · ')
  const sello = resolveSello(artist.artworks, artist.sello_artwork_id)

  return (
    <Link href={{ pathname: '/artista/[slug]', params: { slug: artist.slug } }} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <Sello
          imageUrl={sello.imageUrl}
          palette={sello.palette}
          initials={artistInitials(artist.name)}
          recyclingKey={artist.id}
        />
        <View style={styles.rowText}>
          <Text style={[styles.name, { color: theme.text }]}>{artist.name}</Text>
          {meta ? <Text style={[styles.meta, { color: theme.muted }]}>{meta}</Text> : null}
        </View>
        <Text style={[styles.chevron, { color: theme.faint }]}>›</Text>
      </Pressable>
    </Link>
  )
}

export function ArtistSeparator() {
  const theme = useTheme()
  return <View style={[styles.separator, { backgroundColor: theme.border }]} />
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 17,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  chevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
  },
  separator: {
    height: 1,
  },
})

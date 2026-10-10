import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { ArtworkThumb } from '@/components/artwork-thumb'
import { heroSource, type CatalogRow } from '@/lib/artworks'
import { useTheme } from '@/lib/theme'

// Art-first catalog row (ADR-0020) + the list separator, extracted from the
// Catalogo route. The separator is a module-scope component so FlatList sees
// one stable type — an inline arrow remounts separators on every re-render.

export function CatalogRowItem({ artwork }: { artwork: CatalogRow }) {
  const theme = useTheme()
  const artist = artwork.artists?.name
  return (
    <Link
      href={{ pathname: '/obra/[slug]', params: { slug: artwork.slug } }}
      asChild
    >
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <ArtworkThumb
          source={heroSource(artwork, 240)}
          palette={artwork.palette}
          slug={artwork.slug}
        />
        <View style={styles.rowText}>
          <Text style={[styles.title, { color: theme.text }]}>{artwork.title_es}</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>
            {artist}
            {artwork.year ? ` · ${artwork.year}` : ''}
          </Text>
        </View>
      </Pressable>
    </Link>
  )
}

export function CatalogSeparator() {
  const theme = useTheme()
  return <View style={[styles.separator, { backgroundColor: theme.border }]} />
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 17,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  separator: {
    height: 1,
  },
})

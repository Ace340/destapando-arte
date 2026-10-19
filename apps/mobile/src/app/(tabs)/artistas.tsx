import { useCallback } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SetupNotice } from '@/components/setup-notice'
import { listArtists, publishedCount, type ArtistListRow } from '@/lib/artists'
import { isConfigured } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// GLOSSARY Artistas (section) / ADR-0022: only artists with at least one
// published obra. Row rendering lives in src/components (AGENTS.md) — same
// module-scope separator rule as the catalog (stable type for FlatList).

function ArtistRowItem({ artist }: { artist: ArtistListRow }) {
  const theme = useTheme()
  const count = publishedCount(artist)
  const years = [artist.born_year, artist.died_year].filter(Boolean).join(' – ')
  const meta = [years, `${count} ${count === 1 ? 'obra' : 'obras'}`].filter(Boolean).join(' · ')

  return (
    <Link href={{ pathname: '/artista/[slug]', params: { slug: artist.slug } }} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <View style={styles.rowText}>
          <Text style={[styles.name, { color: theme.text }]}>{artist.name}</Text>
          {meta ? <Text style={[styles.meta, { color: theme.muted }]}>{meta}</Text> : null}
        </View>
        <Text style={[styles.chevron, { color: theme.faint }]}>›</Text>
      </Pressable>
    </Link>
  )
}

function ArtistSeparator() {
  const theme = useTheme()
  return <View style={[styles.separator, { backgroundColor: theme.border }]} />
}

export default function Artistas() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const fetchArtists = useCallback(() => (isConfigured() ? listArtists() : null), [])
  const state = useAsync<ArtistListRow[]>(fetchArtists)

  if (!isConfigured()) return <SetupNotice />

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg, paddingTop: insets.top + 12 }]}>
      <Text style={[styles.brand, { color: theme.faint }]}>Destapando el Arte</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>Artistas</Text>
      {state.kind === 'loading' ? (
        <ActivityIndicator style={styles.center} size="large" color={theme.muted} />
      ) : null}
      {state.kind === 'error' ? <Text style={[styles.error, { color: theme.episode }]}>{state.message}</Text> : null}
      {state.kind === 'ready' ? (
        <FlatList
          data={state.data}
          keyExtractor={(artist) => artist.id}
          ItemSeparatorComponent={ArtistSeparator}
          renderItem={({ item }) => <ArtistRowItem artist={item} />}
          contentContainerStyle={styles.list}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
  },
  brand: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: 4,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 24,
  },
  center: {
    marginTop: 48,
  },
  error: {
    marginTop: 24,
    fontSize: 14,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
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

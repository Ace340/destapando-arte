import { useCallback } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native'

import { ArtistRowItem, ArtistSeparator } from '@/components/artist-row'
import { SectionScreen } from '@/components/section-screen'
import { SetupNotice } from '@/components/setup-notice'
import { listArtists, type ArtistListRow } from '@/lib/artists'
import { isConfigured } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// GLOSSARY Artistas (section) / ADR-0022: only artists with at least one
// published obra. Row rendering lives in src/components (AGENTS.md) — same
// module-scope separator rule as the catalog (stable type for FlatList).

export default function Artistas() {
  const theme = useTheme()
  const fetchArtists = useCallback(() => (isConfigured() ? listArtists() : null), [])
  const state = useAsync<ArtistListRow[]>(fetchArtists)

  if (!isConfigured()) return <SetupNotice />

  return (
    <SectionScreen subtitle="Artistas">
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
    </SectionScreen>
  )
}

const styles = StyleSheet.create({
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
})

import { useCallback } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SetupNotice } from '@/components/setup-notice'
import { WallCard } from '@/components/wall-card'
import { list, type CatalogRow } from '@/lib/artworks'
import { isConfigured } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// The catalog wall (ADR-0020) opened by the Apertura (GLOSSARY): one scroll
// of full-bleed cards. The first card is the Apertura — a random published
// work re-picked on every cold start, shown once, never repeated below — and
// the rest follow in title order. Card rendering lives in
// src/components/wall-card. The "Descubre" title floats above the scroll;
// the top band is reserved for it.

export default function Catalogo() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  // The random pick happens in the fetch chain — an async callback, not
  // render — so the impure Math.random call never runs during render
  // (react-hooks/purity). The fetcher resolves to the wall already rotated:
  // Apertura first, the rest behind it in title order.
  const fetchCatalog = useCallback((): Promise<CatalogRow[]> | null => {
    if (!isConfigured()) return null
    return list().then((rows) => {
      if (rows.length === 0) return rows
      const apertura = Math.floor(Math.random() * rows.length)
      return [rows[apertura], ...rows.filter((_, i) => i !== apertura)]
    })
  }, [])
  const state = useAsync<CatalogRow[]>(fetchCatalog)
  const rows = state.kind === 'ready' ? state.data : null

  if (!isConfigured()) return <SetupNotice />

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      {state.kind === 'loading' ? (
        <ActivityIndicator style={styles.center} size="large" color={theme.muted} />
      ) : null}
      {state.kind === 'error' ? <Text style={[styles.error, { color: theme.episode }]}>{state.message}</Text> : null}
      {rows && rows.length > 0 ? (
        <FlatList
          data={rows}
          keyExtractor={(artwork) => artwork.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <WallCard artwork={item} />}
          contentContainerStyle={[styles.list, { paddingTop: insets.top + HEADER_ROOM }]}
        />
      ) : null}
      {rows && rows.length === 0 ? (
        <View style={[styles.empty, { paddingTop: insets.top + HEADER_ROOM }]}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Todavía no hay obras publicadas</Text>
          <Text style={[styles.emptyBody, { color: theme.muted }]}>
            Cuando el Tablero publique una obra con su historia, aparecerá aquí para leerla.
          </Text>
        </View>
      ) : null}
      <View pointerEvents="none" style={[styles.floatingHeader, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.floatingTitle, { color: theme.text }]}>Descubre</Text>
      </View>
    </View>
  )
}

// Height of the reserved top band: the floating title's room, measured from
// the top safe-area edge down to the first image.
const HEADER_ROOM = 44

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    marginTop: 96,
  },
  error: {
    marginTop: 48,
    marginHorizontal: 24,
    fontSize: 14,
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
  },
  emptyBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  floatingTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
})

import { useCallback, useMemo } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AperturaCard } from '@/components/apertura-card'
import { SetupNotice } from '@/components/setup-notice'
import { list, type CatalogRow } from '@/lib/artworks'
import { isConfigured } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// The catalog wall (ADR-0020) opened by the Apertura (GLOSSARY): one scroll of
// full-bleed cards. The first card is a random published work — re-picked on
// every cold start, shown once, never repeated below — and the rest follow in
// title order. Card rendering lives in src/components/apertura-card. The
// "Descubre" title floats above the scroll; the top band is reserved for it.

interface Wall {
  apertura: CatalogRow | null
  rest: CatalogRow[]
}

// What the fetch resolves to: the published rows plus the randomly chosen
// Apertura index (null only when the catalog is empty).
interface CatalogPick {
  rows: CatalogRow[]
  pick: number | null
}

// Pure split; the random pick is injected so the only impurity lives at the
// call site. Null apertura when the catalog is empty.
function splitWall(rows: CatalogRow[], pickIndex: (count: number) => number): Wall {
  if (rows.length === 0) return { apertura: null, rest: [] }
  const index = pickIndex(rows.length)
  return {
    apertura: rows[index],
    rest: rows.filter((_, i) => i !== index),
  }
}

export default function Catalogo() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  // The random pick happens in the fetch chain — an async callback, not
  // render — so the impure Math.random call never runs during render. The
  // fetcher resolves to the rows plus the chosen index; the pure splitWall
  // consumes it below.
  const fetchCatalog = useCallback((): Promise<CatalogPick> | null => {
    if (!isConfigured()) return null
    return list().then((rows) => ({
      rows,
      pick: rows.length === 0 ? null : Math.floor(Math.random() * rows.length),
    }))
  }, [])
  const state = useAsync<CatalogPick>(fetchCatalog)

  const catalog = state.kind === 'ready' ? state.data : null
  const wall = useMemo(
    () => (catalog ? splitWall(catalog.rows, () => catalog.pick ?? 0) : null),
    [catalog],
  )

  if (!isConfigured()) return <SetupNotice />

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      {state.kind === 'loading' ? (
        <ActivityIndicator style={styles.center} size="large" color={theme.muted} />
      ) : null}
      {state.kind === 'error' ? <Text style={[styles.error, { color: theme.episode }]}>{state.message}</Text> : null}
      {state.kind === 'ready' && wall?.apertura ? (
        <FlatList
          data={[wall.apertura, ...wall.rest]}
          keyExtractor={(artwork) => artwork.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <AperturaCard artwork={item} />}
          contentContainerStyle={[styles.list, { paddingTop: insets.top + HEADER_ROOM }]}
        />
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

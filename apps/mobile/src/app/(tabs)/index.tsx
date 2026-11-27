import { useCallback } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SetupNotice } from '@/components/setup-notice'
import { StyleStrip } from '@/components/style-strip'
import { WallCard } from '@/components/wall-card'
import { list, type CatalogRow } from '@/lib/artworks'
import { list as listStyleChips, SIN_CLASIFICAR, type StyleChipRow } from '@/lib/styles'
import { isConfigured } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// The catalog wall (ADR-0020) opened by the Apertura (GLOSSARY): one scroll
// of full-bleed cards. The first card is the Apertura — a random published
// work re-picked on every cold start, shown once, never repeated below —
// and the rest follow in title order. Card rendering lives in
// src/components/wall-card. The "Descubre" title floats above the scroll;
// the top band is reserved for it.
//
// The Estilos strip (ADR-0025) rides inline after the third card: the wall
// data is a flat union list — artwork, artwork, artwork, strip, artwork… —
// so it scrolls away with the wall, never sticky. Chips are style
// thumbnails (lib/styles list, ADR-0023 derivation), single-select, and
// «Sin clasificar» rides last as the dev-time chip until style coverage
// is complete.

export default function Catalogo() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  // The random pick happens in the fetch chain — an async callback, not
  // render — so the impure Math.random call never runs during render
  // (react-hooks/purity). The fetcher resolves to the wall already
  // stacked: Apertura first, then the strip after the third card, then
  // the rest in title order.
  const fetchWall = useCallback((): Promise<WallItem[] | null> | null => {
    if (!isConfigured()) return null
    return Promise.all([list(), listStyleChips()]).then(([rows, styleChips]) => {
      if (rows.length === 0) return []
      const apertura = Math.floor(Math.random() * rows.length)
      const wall = [rows[apertura], ...rows.filter((_, i) => i !== apertura)]
      const chips: StyleChipRow[] = [
        ...styleChips,
        // ADR-0025: placeholder, not a style row; retires at full coverage.
        { id: SIN_CLASIFICAR, slug: SIN_CLASIFICAR, name: 'Sin clasificar', wikidata_id: null, representative: null },
      ]
      const items: WallItem[] = wall
        .slice(0, STRIP_POSITION)
        .map((artwork) => ({ kind: 'artwork', artwork }))
      items.push({ kind: 'strip', chips })
      for (const artwork of wall.slice(STRIP_POSITION)) items.push({ kind: 'artwork', artwork })
      return items
    })
  }, [])
  const state = useAsync<WallItem[] | null>(fetchWall)
  const items = state.kind === 'ready' ? state.data : null

  if (!isConfigured()) return <SetupNotice />

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      {state.kind === 'loading' ? (
        <ActivityIndicator style={styles.center} size="large" color={theme.muted} />
      ) : null}
      {state.kind === 'error' ? <Text style={[styles.error, { color: theme.episode }]}>{state.message}</Text> : null}
      {items && items.length > 0 ? (
        <FlatList
          data={items}
          keyExtractor={(item) => (item.kind === 'artwork' ? item.artwork.id : 'estilos-strip')}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            item.kind === 'artwork' ? (
              <WallCard artwork={item.artwork} />
            ) : (
              <StyleStrip chips={item.chips} />
            )
          }
          contentContainerStyle={[styles.list, { paddingTop: insets.top + HEADER_ROOM }]}
        />
      ) : null}
      {items && items.length === 0 ? (
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

// The Estilos strip sits after the third wall card (ADR-0025) — the count
// includes the Apertura, which is the wall's first card.
const STRIP_POSITION = 3

type WallItem =
  | { kind: 'artwork'; artwork: CatalogRow }
  | { kind: 'strip'; chips: StyleChipRow[] }

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

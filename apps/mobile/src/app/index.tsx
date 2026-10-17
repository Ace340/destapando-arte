import { useCallback } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CatalogRowItem, CatalogSeparator } from '@/components/catalog-row'
import { FloatingDock, useDockScroll } from '@/components/floating-dock'
import { SetupNotice } from '@/components/setup-notice'
import { list, type CatalogRow } from '@/lib/artworks'
import { isConfigured } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// The catalog (ADR-0020): the wall of paintings. Row rendering lives in
// src/components/catalog-row. Section switching lives in the floating dock.

export default function Catalogo() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const fetchCatalog = useCallback(() => (isConfigured() ? list() : null), [])
  const state = useAsync<CatalogRow[]>(fetchCatalog)
  const { onScroll, hidden } = useDockScroll()

  if (!isConfigured()) return <SetupNotice />

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg, paddingTop: insets.top + 12 }]}>
      <View>
        <Text style={[styles.brand, { color: theme.faint }]}>Destapando el Arte</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Las historias detrás de los cuadros</Text>
      </View>
      {state.kind === 'loading' ? (
        <ActivityIndicator style={styles.center} size="large" color={theme.muted} />
      ) : null}
      {state.kind === 'error' ? <Text style={[styles.error, { color: theme.episode }]}>{state.message}</Text> : null}
      {state.kind === 'ready' ? (
        <Animated.FlatList
          data={state.data}
          keyExtractor={(artwork) => artwork.id}
          ItemSeparatorComponent={CatalogSeparator}
          renderItem={({ item }) => <CatalogRowItem artwork={item} />}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.list}
        />
      ) : null}
      <FloatingDock hidden={hidden} />
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
    // Clearance for the floating menu (56px hub + 20px bottom offset).
    paddingBottom: 112,
  },
})

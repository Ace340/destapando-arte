import { useCallback } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native'

import { CatalogRowItem, CatalogSeparator } from '@/components/catalog-row'
import { SectionScreen } from '@/components/section-screen'
import { SetupNotice } from '@/components/setup-notice'
import { list, type CatalogRow } from '@/lib/artworks'
import { isConfigured } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// The catalog (ADR-0020): the wall of paintings. Row rendering lives in
// src/components/catalog-row. Section switching lives in the tab bar.

export default function Catalogo() {
  const theme = useTheme()
  const fetchCatalog = useCallback(() => (isConfigured() ? list() : null), [])
  const state = useAsync<CatalogRow[]>(fetchCatalog)

  if (!isConfigured()) return <SetupNotice />

  return (
    <SectionScreen subtitle="Las historias detrás de los cuadros">
      {state.kind === 'loading' ? (
        <ActivityIndicator style={styles.center} size="large" color={theme.muted} />
      ) : null}
      {state.kind === 'error' ? <Text style={[styles.error, { color: theme.episode }]}>{state.message}</Text> : null}
      {state.kind === 'ready' ? (
        <FlatList
          data={state.data}
          keyExtractor={(artwork) => artwork.id}
          ItemSeparatorComponent={CatalogSeparator}
          renderItem={({ item }) => <CatalogRowItem artwork={item} />}
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

import { useCallback } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native'

import { CityRowItem, CitySeparator } from '@/components/city-row'
import { SectionEmpty, SectionScreen } from '@/components/section-screen'
import { SetupNotice } from '@/components/setup-notice'
import { listCities, type CityListRow } from '@/lib/cities'
import { isConfigured } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// GLOSSARY Ciudades (section) / ADR-0024: hand-created editorial entities —
// the Tablero creates them and creation is the listing gate (no draft
// state, no derived threshold). Row rendering lives in src/components
// (AGENTS.md) — same module-scope separator rule as the catalog.

export default function Ciudades() {
  const theme = useTheme()
  const fetchCities = useCallback(() => (isConfigured() ? listCities() : null), [])
  const state = useAsync<CityListRow[]>(fetchCities)

  if (!isConfigured()) return <SetupNotice />

  return (
    <SectionScreen subtitle="Ciudades">
      {state.kind === 'loading' ? (
        <ActivityIndicator style={styles.center} size="large" color={theme.muted} />
      ) : null}
      {state.kind === 'error' ? <Text style={[styles.error, { color: theme.episode }]}>{state.message}</Text> : null}
      {state.kind === 'ready' ? (
        state.data.length > 0 ? (
          <FlatList
            data={state.data}
            keyExtractor={(city) => city.id}
            ItemSeparatorComponent={CitySeparator}
            renderItem={({ item }) => <CityRowItem city={item} />}
            contentContainerStyle={styles.list}
          />
        ) : (
          <SectionEmpty
            title="Todavía no hay ciudades"
            hint="Las primeras ciudades llegarán pronto"
          />
        )
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

import { useLocalSearchParams } from 'expo-router'
import { Fragment, useCallback } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CatalogRowItem, CatalogSeparator } from '@/components/catalog-row'
import { ObraFallback } from '@/components/obra-fallback'
import { PrivacyFooter } from '@/components/privacy-footer'
import { StorySection } from '@/components/story-section'
import { bundle, type StyleBundle } from '@/lib/styles'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// The Estilo browse list (ADR-0025): the derived «Obras del estilo» —
// every published obra with this style, in title order. A derived view,
// not an editorial surface: pure taxonomy in v1 means nothing to write
// here. «Sin clasificar» is the dev-time chip's destination (not a style
// row) and retires at full coverage.

const NOT_FOUND_BODY =
  'Este estilo todavía no tiene página. Vuelve a Descubre y elige otro.'

export default function Estilo() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const fetchBundle = useCallback((): Promise<StyleBundle | null> | null => {
    if (typeof slug !== 'string' || !slug) return null
    return bundle(slug)
  }, [slug])
  const state = useAsync<StyleBundle | null>(fetchBundle)

  if (state.kind === 'loading') {
    return (
      <View style={[styles.screen, { backgroundColor: theme.bg }]}>
        <ActivityIndicator style={styles.center} size="large" color={theme.muted} />
      </View>
    )
  }

  if (state.kind === 'error') {
    return <ObraFallback title="Algo falló" body={state.message} />
  }

  const data = state.data
  if (!data) {
    return <ObraFallback title="Estilo no encontrado" body={NOT_FOUND_BODY} />
  }

  const { style, obras } = data
  const title = style?.name ?? 'Sin clasificar'
  const listLabel = style ? 'Obras del estilo' : 'Obras sin clasificar'

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: 48 }]}
    >
      <Text style={[styles.brand, { color: theme.faint }]}>Estilos</Text>
      <Text style={[styles.name, { color: theme.text }]}>{title}</Text>

      {/* ADR-0025: the slug 'sin-clasificar' is the dev-time chip's route,
          not a styles row — the lib special-cases it before the lookup. */}
      <StorySection title={listLabel}>
        {obras.length > 0 ? (
          obras.map((obra, index) => (
            <Fragment key={obra.id}>
              {index > 0 ? <CatalogSeparator /> : null}
              <CatalogRowItem artwork={obra} />
            </Fragment>
          ))
        ) : (
          <Text style={[styles.emptyBody, { color: theme.muted }]}>
            {style
              ? 'Todavía no hay obras publicadas de este estilo.'
              : 'Todavía no hay obras sin clasificar — clasifícalas en el Tablero.'}
          </Text>
        )}
      </StorySection>

      <PrivacyFooter />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  brand: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  name: {
    marginTop: 12,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
  },
  emptyBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  center: {
    marginTop: 48,
  },
})

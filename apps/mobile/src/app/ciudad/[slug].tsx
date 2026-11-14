import { useLocalSearchParams } from 'expo-router'
import { Fragment, useCallback } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CatalogRowItem, CatalogSeparator } from '@/components/catalog-row'
import { CityImage } from '@/components/city-image'
import { LugarRow } from '@/components/lugar-row'
import { ObraFallback } from '@/components/obra-fallback'
import { PrivacyFooter } from '@/components/privacy-footer'
import { BodyText, StorySection } from '@/components/story-section'
import { getCityBySlug, obrasEnCiudad, type CityPageData } from '@/lib/cities'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// The Ciudad page (ADR-0024): deliberately thin — the derived «Obras aquí»
// list (published catalog obras with a physical_instance in the city,
// matched by NAME) plus the hand-curated «Lugares». Exists even with zero
// obras: the honest stub shows Lugares only (the Casa Azul case). Mobile
// only in v1 — no /ciudad/{slug} web page; the tab is the only surface.

const NOT_FOUND_BODY =
  'Esta ciudad todavía no tiene página pública. Vuelve a Ciudades y elige otra.'

export default function Ciudad() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()

  const fetchCity = useCallback(async () => {
    if (typeof slug !== 'string' || !slug) return null
    const bundle = await getCityBySlug(slug)
    if (!bundle) return null
    // Obras derive from the city NAME — the editor's hand data arrives first.
    const obras = await obrasEnCiudad(bundle.city.name)
    return { ...bundle, obras }
  }, [slug])
  const state = useAsync<CityPageData | null>(fetchCity)

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
    return <ObraFallback title="Ciudad no encontrada" body={NOT_FOUND_BODY} />
  }

  const { city, lugares, obras } = data

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: 48 }]}
    >
      <Text style={[styles.brand, { color: theme.faint }]}>Destapando el Arte</Text>
      <Text style={[styles.name, { color: theme.text }]}>{city.name}</Text>

      {/* The city picture (ADR-0008): the editor's Commons link or the
          initial monogram placeholder — the honest empty state, same rule
          as the Lugares list. */}
      <CityImage
        imageUrl={city.image_url}
        name={city.name}
        width={screenWidth - 48} // paddingHorizontal: 24 each side
        height={168}
        radius={16}
        recyclingKey={city.id}
        style={styles.hero}
      />

      {/* The city story (ADR-0024): one hand-written editorial paragraph from
          the Tablero. Null is the honest stub — no section renders at all. */}
      {city.story ? (
        <StorySection title="Historia">
          <BodyText>{city.story}</BodyText>
        </StorySection>
      ) : null}

      <StorySection title="Obras aquí">
        {obras.length > 0 ? (
          obras.map((obra, index) => (
            <Fragment key={obra.id}>
              {index > 0 ? <CatalogSeparator /> : null}
              <CatalogRowItem artwork={obra} />
            </Fragment>
          ))
        ) : (
          <BodyText>Todavía no hay obras del catálogo en esta ciudad.</BodyText>
        )}
      </StorySection>

      <StorySection title="Lugares">
        {lugares.length > 0 ? (
          lugares.map((lugar) => <LugarRow key={lugar.id} lugar={lugar} />)
        ) : (
          <BodyText>Aún no hay lugares curados para esta ciudad.</BodyText>
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
  hero: {
    marginTop: 16,
  },
  center: {
    marginTop: 48,
  },
})

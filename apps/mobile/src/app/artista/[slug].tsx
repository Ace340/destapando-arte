import { useLocalSearchParams } from 'expo-router'
import { Fragment, useCallback } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CatalogRowItem, CatalogSeparator } from '@/components/catalog-row'
import { EpisodeButton } from '@/components/episode-button'
import { ObraFallback } from '@/components/obra-fallback'
import { PrivacyFooter } from '@/components/privacy-footer'
import { BodyText, StorySection } from '@/components/story-section'
import { getArtist, type ArtistBundle } from '@/lib/artists'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// The Artist page (ADR-0022): why_special hook, optional Bio, and the
// derived Obras view — published member Stories, never hand-typed. Exists
// even with zero obras: the dignified stub (hook + episode) serving
// artist-level fallback duty. Mirror of the web /artista/[slug] page.

const NOT_FOUND_BODY =
  'Este artista todavía no tiene página pública. Vuelve a Artistas y elige otro.'

export default function Artista() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const fetchArtist = useCallback(
    () => (typeof slug === 'string' && slug ? getArtist(slug) : null),
    [slug],
  )
  const state = useAsync<ArtistBundle | null>(fetchArtist)

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

  const bundle = state.data
  if (!bundle) {
    return <ObraFallback title="Artista no encontrado" body={NOT_FOUND_BODY} />
  }

  const { artist, obras } = bundle
  const years = [artist.born_year, artist.died_year].filter(Boolean).join(' – ')

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: 48 }]}
    >
      <Text style={[styles.brand, { color: theme.faint }]}>Destapando el Arte</Text>
      <Text style={[styles.name, { color: theme.text }]}>{artist.name}</Text>
      {years ? <Text style={[styles.years, { color: theme.muted }]}>{years}</Text> : null}

      {artist.why_special ? (
        <StorySection title="Por qué es especial">
          <BodyText>{artist.why_special}</BodyText>
        </StorySection>
      ) : null}

      {artist.bio ? (
        <StorySection title="Su historia">
          <BodyText>{artist.bio}</BodyText>
        </StorySection>
      ) : null}

      <StorySection title="Obras">
        {obras.length > 0 ? (
          obras.map((obra, index) => (
            <Fragment key={obra.id}>
              {index > 0 ? <CatalogSeparator /> : null}
              <CatalogRowItem artwork={obra} />
            </Fragment>
          ))
        ) : (
          <BodyText>Aún no hay obras publicadas — la primera llegará pronto.</BodyText>
        )}
      </StorySection>

      {artist.episode_youtube_id ? (
        <EpisodeButton youtubeId={artist.episode_youtube_id} />
      ) : null}

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
    marginTop: 8,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
  },
  years: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  center: {
    marginTop: 48,
  },
})

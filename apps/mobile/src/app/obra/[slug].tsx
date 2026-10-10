import { useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ConnectionCard } from '@/components/connection-card'
import { CuriosityCard } from '@/components/curiosity-card'
import { EpisodeButton } from '@/components/episode-button'
import { Hero } from '@/components/hero'
import { ObraFallback } from '@/components/obra-fallback'
import { PrivacyFooter } from '@/components/privacy-footer'
import { BodyText, StorySection } from '@/components/story-section'
import { HEADER_CONTENT_HEIGHT, StoryHeader } from '@/components/story-header'
import { get, heroCredit, heroSource, type StoryBundle } from '@/lib/artworks'
import { useTheme } from '@/lib/theme'
import { useAsync } from '@/lib/use-async'

// The reading surface (ADR-0020): art-first Hero, Story scrolls up beneath
// it, collapsing header once the title is gone. Public truth gate — mirror
// of the web /obra/[slug] page: only published works exist here; everything
// else is "Obra no encontrada". Sections, cards and fallbacks live in
// src/components.

const HERO_FRACTION = 0.62

const NOT_FOUND_BODY =
  'Aquí solo existen las historias publicadas. Vuelve al catálogo y elige otra obra.'

export default function Historia() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const theme = useTheme()
  const scheme = useColorScheme()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()

  const fetchStory = useCallback(
    () => (typeof slug === 'string' && slug ? get(slug) : null),
    [slug],
  )
  const state = useAsync<StoryBundle | null>(fetchStory)

  const heroHeight = Math.round(windowHeight * HERO_FRACTION)
  const showHeaderAt = heroHeight - (insets.top + HEADER_CONTENT_HEIGHT) - 24

  const [headerVisible, setHeaderVisible] = useState(false)
  const passedThreshold = useSharedValue(false)
  const scrollY = useSharedValue(0)

  const onScroll = useAnimatedScrollHandler((event) => {
    const y = event.contentOffset.y
    scrollY.value = y
    const shouldShow = y > showHeaderAt
    if (shouldShow !== passedThreshold.value) {
      passedThreshold.value = shouldShow
      runOnJS(setHeaderVisible)(shouldShow)
    }
  })

  // Parallax: the hero scrolls at half speed; the gradient base layer inside
  // the Hero keeps the frame covered while the image lags behind.
  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.5 }],
  }))

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
    return <ObraFallback title="Obra no encontrada" body={NOT_FOUND_BODY} />
  }

  const { artwork, curiosities, connections } = bundle
  const metaLine = [artwork.artists?.name, artwork.year].filter(Boolean).join(' · ')
  const credit = heroCredit(artwork)

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      {/* Light icons over the hero; switch to theme icons once the header
          surface covers the status bar. */}
      <StatusBar
        style={
          headerVisible ? (scheme === 'dark' ? 'light' : 'dark') : 'light'
        }
      />
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={styles.scrollContent}>
        <Hero
          source={heroSource(artwork)}
          palette={artwork.palette}
          title={artwork.title_es}
          meta={metaLine}
          accentFallback={theme.accentFallback}
          height={heroHeight}
          style={heroStyle}
        />
        <View style={styles.content}>
          {credit ? <Text style={[styles.credit, { color: theme.faint }]}>Imagen: {credit}</Text> : null}

          {artwork.summary ? (
            <StorySection title="¿Qué es?">
              <BodyText>{artwork.summary}</BodyText>
            </StorySection>
          ) : null}

          {artwork.why_it_matters ? (
            <StorySection title="¿Por qué importa?">
              <BodyText>{artwork.why_it_matters}</BodyText>
            </StorySection>
          ) : null}

          {curiosities.length > 0 ? (
            <StorySection title="Curiosidades que nadie te cuenta">
              {curiosities.map((curiosity) => (
                <CuriosityCard key={curiosity.id} curiosity={curiosity} />
              ))}
            </StorySection>
          ) : null}

          {connections.length > 0 ? (
            <StorySection title="El cine que tomó prestado su lenguaje">
              {connections.map((connection) => (
                <ConnectionCard key={connection.id} connection={connection} />
              ))}
            </StorySection>
          ) : null}

          {artwork.essay ? (
            <StorySection title="La historia completa">
              <BodyText>{artwork.essay}</BodyText>
            </StorySection>
          ) : null}

          {artwork.episode_youtube_id ? (
            <EpisodeButton youtubeId={artwork.episode_youtube_id} />
          ) : null}

          <PrivacyFooter />
        </View>
      </Animated.ScrollView>
      <StoryHeader visible={headerVisible} title={artwork.title_es} />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  center: {
    marginTop: 48,
  },
  credit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginBottom: 4,
  },
})

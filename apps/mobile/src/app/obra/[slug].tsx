import { useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as WebBrowser from 'expo-web-browser'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
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

import { CuriosityBadge } from '@/components/curiosity-badge'
import { Hero } from '@/components/hero'
import { HEADER_CONTENT_HEIGHT, StoryHeader } from '@/components/story-header'
import { get, heroCredit, heroSource, type StoryBundle } from '@/lib/artworks'
import { message } from '@/lib/error'
import { useTheme } from '@/lib/theme'

// The reading surface (ADR-0020): art-first Hero, Story scrolls up beneath
// it, collapsing header once the title is gone. Public truth gate — mirror
// of the web /obra/[slug] page: only published works exist here; everything
// else is "Obra no encontrada".

const HERO_FRACTION = 0.62

type State =
  | { kind: 'loading' }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; bundle: StoryBundle }

export default function Historia() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [state, setState] = useState<State>({ kind: 'loading' })
  const theme = useTheme()
  const scheme = useColorScheme()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()

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

  useEffect(() => {
    if (typeof slug !== 'string' || !slug) return
    let cancelled = false
    get(slug)
      .then((bundle) => {
        if (!cancelled) setState(bundle ? { kind: 'ready', bundle } : { kind: 'notFound' })
      })
      .catch((error) => {
        if (!cancelled) setState({ kind: 'error', message: message(error) })
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (state.kind === 'loading') {
    return (
      <View style={[styles.screen, { backgroundColor: theme.bg }]}>
        <ActivityIndicator style={styles.center} size="large" color={theme.muted} />
      </View>
    )
  }

  if (state.kind === 'notFound' || state.kind === 'error') {
    return (
      <View style={[styles.screen, { backgroundColor: theme.bg, padding: 24, paddingTop: insets.top + 40 }]}>
        <Text style={[styles.brand, { color: theme.faint }]}>Destapando el Arte</Text>
        <Text style={[styles.plainTitle, { color: theme.text }]}>
          {state.kind === 'notFound' ? 'Obra no encontrada' : 'Algo falló'}
        </Text>
        <Text style={[styles.body, { color: theme.muted }]}>
          {state.kind === 'notFound'
            ? 'Aquí solo existen las historias publicadas. Vuelve al catálogo y elige otra obra.'
            : state.message}
        </Text>
      </View>
    )
  }

  const { artwork, curiosities, connections } = state.bundle
  const artistName = artwork.artists?.name
  const metaLine = [artistName, artwork.year].filter(Boolean).join(' · ')
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
            <Section title="¿Qué es?">
              <Text style={[styles.body, { color: theme.body }]}>{artwork.summary}</Text>
            </Section>
          ) : null}

          {artwork.why_it_matters ? (
            <Section title="¿Por qué importa?">
              <Text style={[styles.body, { color: theme.body }]}>{artwork.why_it_matters}</Text>
            </Section>
          ) : null}

          {curiosities.length > 0 ? (
            <Section title="Curiosidades que nadie te cuenta">
              {curiosities.map((curiosity) => (
                <View
                  key={curiosity.id}
                  style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <CuriosityBadge type={curiosity.type} />
                  <Text style={[styles.body, { color: theme.body }]}>{curiosity.text}</Text>
                  <SourceLink url={curiosity.source_url} label="fuente" />
                </View>
              ))}
            </Section>
          ) : null}

          {connections.length > 0 ? (
            <Section title="El cine que tomó prestado su lenguaje">
              {connections.map((connection) => (
                <View
                  key={connection.id}
                  style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <Text style={[styles.filmTitle, { color: theme.text }]}>
                    {connection.films?.title}
                    {connection.films?.year ? ` (${connection.films.year})` : ''}
                    {connection.films?.director ? ` — dir. ${connection.films.director}` : ''}
                  </Text>
                  <Text style={[styles.borrowed, { color: theme.muted }]}>{connection.what_it_borrowed}</Text>
                  <Text style={[styles.body, { color: theme.body }]}>{connection.frame_analysis_text}</Text>
                  {connection.evidence_url && connection.evidence_visual !== 'none' ? (
                    <SourceLink url={connection.evidence_url} label="ver la escena" />
                  ) : null}
                </View>
              ))}
            </Section>
          ) : null}

          {artwork.essay ? (
            <Section title="La historia completa">
              <Text style={[styles.body, { color: theme.body }]}>{artwork.essay}</Text>
            </Section>
          ) : null}

          {artwork.episode_youtube_id ? (
            <Pressable
              style={({ pressed }) => [
                styles.episodeButton,
                { backgroundColor: theme.episode },
                pressed && styles.pressed,
              ]}
              onPress={() => void WebBrowser.openBrowserAsync(episodeUrl(artwork.episode_youtube_id!))}
            >
              <Text style={styles.episodeText}>▶ Ver el episodio</Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.ScrollView>
      <StoryHeader visible={headerVisible} title={artwork.title_es} theme={theme} />
    </View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme()
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

function SourceLink({ url, label }: { url: string; label: string }) {
  const theme = useTheme()
  return (
    <Pressable onPress={() => void WebBrowser.openBrowserAsync(url)}>
      {({ pressed }) => (
        <Text style={[styles.sourceLink, { color: theme.link }, pressed && styles.pressed]}>{label}</Text>
      )}
    </Pressable>
  )
}

function episodeUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
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
  brand: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  plainTitle: {
    marginTop: 8,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
  },
  credit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  section: {
    marginTop: 32,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
  },
  sectionBody: {
    gap: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  filmTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  borrowed: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  sourceLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
  },
  episodeButton: {
    marginTop: 40,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  episodeText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.6,
  },
})

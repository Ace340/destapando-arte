import { useLocalSearchParams } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { CuriosityBadge } from '@/components/curiosity-badge'
import { PaletteStripe } from '@/components/palette-stripe'
import { get, type StoryBundle } from '@/lib/artworks'
import { message } from '@/lib/error'

// Public truth gate — mirror of the web /obra/[slug] page: only published
// works exist here. Everything else is "Obra no encontrada" (the app-side 404).

type State =
  | { kind: 'loading' }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; bundle: StoryBundle }

export default function Historia() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [state, setState] = useState<State>({ kind: 'loading' })

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
      <View style={styles.screen}>
        <ActivityIndicator style={styles.center} size="large" color="#52525B" />
      </View>
    )
  }

  if (state.kind === 'notFound') {
    return (
      <View style={styles.screen}>
        <Text style={styles.brand}>Destapando el Arte</Text>
        <Text style={styles.title}>Obra no encontrada</Text>
        <Text style={styles.body}>
          Aquí solo existen las historias publicadas. Vuelve al catálogo y elige otra obra.
        </Text>
      </View>
    )
  }

  if (state.kind === 'error') {
    return (
      <View style={styles.screen}>
        <Text style={styles.brand}>Destapando el Arte</Text>
        <Text style={styles.title}>Algo falló</Text>
        <Text style={styles.body}>{state.message}</Text>
      </View>
    )
  }

  const { artwork, curiosities, connections } = state.bundle
  const artistName = artwork.artists?.name

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.screen}>
      <Text style={styles.brand}>Destapando el Arte</Text>
      <Text style={styles.title}>{artwork.title_es}</Text>
      <Text style={styles.meta}>
        {artistName}
        {artwork.year ? ` · ${artwork.year}` : ''}
      </Text>
      <PaletteStripe palette={artwork.palette} />

      {artwork.summary ? (
        <Section title="¿Qué es?">
          <Text style={styles.body}>{artwork.summary}</Text>
        </Section>
      ) : null}

      {artwork.why_it_matters ? (
        <Section title="¿Por qué importa?">
          <Text style={styles.body}>{artwork.why_it_matters}</Text>
        </Section>
      ) : null}

      {curiosities.length > 0 ? (
        <Section title="Curiosidades que nadie te cuenta">
          {curiosities.map((curiosity) => (
            <View key={curiosity.id} style={styles.card}>
              <CuriosityBadge type={curiosity.type} />
              <Text style={styles.body}>{curiosity.text}</Text>
              <SourceLink url={curiosity.source_url} label="fuente" />
            </View>
          ))}
        </Section>
      ) : null}

      {connections.length > 0 ? (
        <Section title="El cine que tomó prestado su lenguaje">
          {connections.map((connection) => (
            <View key={connection.id} style={styles.card}>
              <Text style={styles.filmTitle}>
                {connection.films?.title}
                {connection.films?.year ? ` (${connection.films.year})` : ''}
                {connection.films?.director ? ` — dir. ${connection.films.director}` : ''}
              </Text>
              <Text style={styles.borrowed}>{connection.what_it_borrowed}</Text>
              <Text style={styles.body}>{connection.frame_analysis_text}</Text>
              {connection.evidence_url && connection.evidence_visual !== 'none' ? (
                <SourceLink url={connection.evidence_url} label="ver la escena" />
              ) : null}
            </View>
          ))}
        </Section>
      ) : null}

      {artwork.essay ? (
        <Section title="La historia completa">
          <Text style={styles.body}>{artwork.essay}</Text>
        </Section>
      ) : null}

      {artwork.episode_youtube_id ? (
        <Pressable
          style={({ pressed }) => [styles.episodeButton, pressed && styles.pressed]}
          onPress={() => void WebBrowser.openBrowserAsync(episodeUrl(artwork.episode_youtube_id!))}
        >
          <Text style={styles.episodeText}>▶ Ver el episodio</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

function SourceLink({ url, label }: { url: string; label: string }) {
  return (
    <Pressable onPress={() => void WebBrowser.openBrowserAsync(url)}>
      {({ pressed }) => (
        <Text style={[styles.sourceLink, pressed && styles.pressed]}>{label}</Text>
      )}
    </Pressable>
  )
}

function episodeUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  center: {
    marginTop: 48,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#A1A1AA',
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '600',
    color: '#18181B',
  },
  meta: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 15,
    color: '#52525B',
  },
  section: {
    marginTop: 32,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181B',
  },
  sectionBody: {
    gap: 14,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: '#27272A',
  },
  filmTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
  },
  borrowed: {
    fontSize: 14,
    color: '#52525B',
  },
  sourceLink: {
    fontSize: 13,
    color: '#0369A1',
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
  },
  episodeButton: {
    marginTop: 40,
    backgroundColor: '#B91C1C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  episodeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.6,
  },
})

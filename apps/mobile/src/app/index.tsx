import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

import { PaletteStripe } from '@/components/palette-stripe'
import { SetupNotice } from '@/components/setup-notice'
import { isConfigured } from '@/lib/supabase'
import { list, type CatalogRow } from '@/lib/artworks'
import { message } from '@/lib/error'

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; artworks: CatalogRow[] }

export default function Catalogo() {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    if (!isConfigured()) return
    let cancelled = false
    list()
      .then((artworks) => {
        if (!cancelled) setState({ kind: 'ready', artworks })
      })
      .catch((error) => {
        if (!cancelled) setState({ kind: 'error', message: message(error) })
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!isConfigured()) return <SetupNotice />

  return (
    <View style={styles.screen}>
      <Text style={styles.brand}>Destapando el Arte</Text>
      <Text style={styles.subtitle}>Las historias detrás de los cuadros</Text>
      {state.kind === 'loading' ? (
        <ActivityIndicator style={styles.center} size="large" color="#52525B" />
      ) : null}
      {state.kind === 'error' ? <Text style={styles.error}>{state.message}</Text> : null}
      {state.kind === 'ready' ? (
        <FlatList
          data={state.artworks}
          keyExtractor={(artwork) => artwork.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <CatalogRowItem artwork={item} />}
          contentContainerStyle={styles.list}
        />
      ) : null}
    </View>
  )
}

function CatalogRowItem({ artwork }: { artwork: CatalogRow }) {
  const artist = artwork.artists?.name
  return (
    <Link
      href={{ pathname: '/obra/[slug]', params: { slug: artwork.slug } }}
      asChild
    >
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <View style={styles.rowText}>
          <Text style={styles.title}>{artwork.title_es}</Text>
          <Text style={styles.meta}>
            {artist}
            {artwork.year ? ` · ${artwork.year}` : ''}
          </Text>
        </View>
        <PaletteStripe palette={artwork.palette} height={40} />
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  brand: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#A1A1AA',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '600',
    color: '#18181B',
  },
  center: {
    marginTop: 48,
  },
  error: {
    marginTop: 24,
    fontSize: 14,
    color: '#B91C1C',
  },
  list: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  row: {
    paddingVertical: 14,
    gap: 10,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowText: {
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#18181B',
  },
  meta: {
    fontSize: 14,
    color: '#52525B',
  },
  separator: {
    height: 1,
    backgroundColor: '#F4F4F5',
  },
})

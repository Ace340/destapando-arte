import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArtworkThumb } from '@/components/artwork-thumb'
import { SetupNotice } from '@/components/setup-notice'
import { heroSource, list, type CatalogRow } from '@/lib/artworks'
import { isConfigured } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { message } from '@/lib/error'

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; artworks: CatalogRow[] }

export default function Catalogo() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
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
    <View style={[styles.screen, { backgroundColor: theme.bg, paddingTop: insets.top + 12 }]}>
      <Text style={[styles.brand, { color: theme.faint }]}>Destapando el Arte</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>Las historias detrás de los cuadros</Text>
      {state.kind === 'loading' ? (
        <ActivityIndicator style={styles.center} size="large" color={theme.muted} />
      ) : null}
      {state.kind === 'error' ? <Text style={[styles.error, { color: theme.episode }]}>{state.message}</Text> : null}
      {state.kind === 'ready' ? (
        <FlatList
          data={state.artworks}
          keyExtractor={(artwork) => artwork.id}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
          renderItem={({ item }) => <CatalogRowItem artwork={item} />}
          contentContainerStyle={styles.list}
        />
      ) : null}
    </View>
  )
}

function CatalogRowItem({ artwork }: { artwork: CatalogRow }) {
  const theme = useTheme()
  const artist = artwork.artists?.name
  return (
    <Link
      href={{ pathname: '/obra/[slug]', params: { slug: artwork.slug } }}
      asChild
    >
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <ArtworkThumb
          source={heroSource(artwork, 240)}
          palette={artwork.palette}
          slug={artwork.slug}
        />
        <View style={styles.rowText}>
          <Text style={[styles.title, { color: theme.text }]}>{artwork.title_es}</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>
            {artist}
            {artwork.year ? ` · ${artwork.year}` : ''}
          </Text>
        </View>
      </Pressable>
    </Link>
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
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 17,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  separator: {
    height: 1,
  },
})

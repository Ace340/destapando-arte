import { StyleSheet, Text, View } from 'react-native'

import { BodyText, SourceLink } from '@/components/story-section'
import { useTheme } from '@/lib/theme'
import type { ConnectionRow } from '@/lib/artworks'

// One "El cine que tomó prestado su lenguaje" card (extracted from the route).

export function ConnectionCard({ connection }: { connection: ConnectionRow }) {
  const theme = useTheme()
  const film = connection.films
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.filmTitle, { color: theme.text }]}>
        {film?.title}
        {film?.year ? ` (${film.year})` : ''}
        {film?.director ? ` — dir. ${film.director}` : ''}
      </Text>
      <Text style={[styles.borrowed, { color: theme.muted }]}>{connection.what_it_borrowed}</Text>
      <BodyText>{connection.frame_analysis_text}</BodyText>
      {connection.evidence_url && connection.evidence_visual !== 'none' ? (
        <SourceLink url={connection.evidence_url} label="ver la escena" />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  filmTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  borrowed: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
})

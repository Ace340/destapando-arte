import { StyleSheet, Text, View } from 'react-native'

import { BodyText, SourceLink } from '@/components/story-section'
import { useTheme } from '@/lib/theme'
import type { CityPlace } from '@/lib/types'

// One Lugar (GLOSSARY / ADR-0024) on the Ciudad page: name + optional
// note, and its url as an external link ONLY when the editor stored one
// (ADR-0014: no unverified links — the seed ships NULL). The link reuses
// SourceLink (expo-web-browser), the house pattern for external urls.

export function LugarRow({ lugar }: { lugar: CityPlace }) {
  const theme = useTheme()
  return (
    <View style={styles.lugar}>
      <Text style={[styles.name, { color: theme.text }]}>{lugar.name}</Text>
      {lugar.note ? <BodyText>{lugar.note}</BodyText> : null}
      {lugar.url ? <SourceLink url={lugar.url} label="Ver sitio web" /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  lugar: {
    gap: 6,
  },
  name: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
})

import { StyleSheet, View } from 'react-native'

import { CuriosityBadge } from '@/components/curiosity-badge'
import { BodyText, SourceLink } from '@/components/story-section'
import { useTheme } from '@/lib/theme'
import type { Curiosity } from '@/lib/types'

// One "Curiosidades que nadie te cuenta" card (extracted from the route).

export function CuriosityCard({ curiosity }: { curiosity: Curiosity }) {
  const theme = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <CuriosityBadge type={curiosity.type} />
      <BodyText>{curiosity.text}</BodyText>
      <SourceLink url={curiosity.source_url} label="fuente" />
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
})

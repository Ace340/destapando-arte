import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { CuriosityBadge } from '@/components/curiosity-badge'
import { BodyText, SourceLink } from '@/components/story-section'
import { useTheme } from '@/lib/theme'
import type { Curiosity } from '@/lib/types'

// One "Curiosidades que nadie te cuenta" card (extracted from the route).
// Collapsed by default: the header (badge + one-line preview) toggles the
// body (text + fuente). Parity with the web /obra details/summary rows.

export function CuriosityCard({ curiosity }: { curiosity: Curiosity }) {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={styles.header}
      >
        <View style={styles.headerText}>
          <CuriosityBadge type={curiosity.type} />
          {!open ? (
            <Text numberOfLines={1} style={[styles.preview, { color: theme.muted }]}>
              {curiosity.text}
            </Text>
          ) : null}
        </View>
        <Text aria-hidden style={[styles.chevron, { color: theme.faint }]}>
          {open ? '▾' : '▸'}
        </Text>
      </Pressable>
      {open ? (
        <View style={styles.body}>
          <BodyText>{curiosity.text}</BodyText>
          <SourceLink url={curiosity.source_url} label="fuente" />
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  preview: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  chevron: {
    fontSize: 14,
  },
  body: {
    gap: 8,
  },
})

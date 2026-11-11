import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { BodyText, SourceLink } from '@/components/story-section'
import { useTheme } from '@/lib/theme'
import type { Curiosity } from '@/lib/types'

// One "Curiosidades que nadie te cuenta" card (extracted from the route).
// Collapsed by default: the header (title, or one-line preview when the
// curiosity is untitled) toggles the body — header → text → fuente when
// titled, text + fuente otherwise. Parity with the web /obra details/summary
// rows.

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
          {!open ? (
            curiosity.title ? (
              // The editorial headline is the header while collapsed; when
              // open it moves inside as the body header (no duplicated
              // title). Untitled rows keep the one-line preview.
              <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
                {curiosity.title}
              </Text>
            ) : (
              <Text numberOfLines={1} style={[styles.preview, { color: theme.muted }]}>
                {curiosity.text}
              </Text>
            )
          ) : null}
        </View>
        <Text aria-hidden style={[styles.chevron, { color: theme.faint }]}>
          {open ? '▾' : '▸'}
        </Text>
      </Pressable>
      {open ? (
        <View style={styles.body}>
          {curiosity.title ? (
            <Text style={[styles.bodyTitle, { color: theme.text }]}>{curiosity.title}</Text>
          ) : null}
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
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
  },
  bodyTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
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

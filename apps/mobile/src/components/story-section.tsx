import * as WebBrowser from 'expo-web-browser'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/lib/theme'

// Reading-surface primitives shared by the Historia sections and their cards
// (extracted from the route so src/app/ holds only screens — AGENTS.md).

export function StorySection({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme()
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

export function BodyText({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  return <Text style={[styles.body, { color: theme.body }]}>{children}</Text>
}

export function SourceLink({ url, label }: { url: string; label: string }) {
  const theme = useTheme()
  return (
    <Pressable onPress={() => void WebBrowser.openBrowserAsync(url)}>
      {({ pressed }) => (
        <Text style={[styles.sourceLink, { color: theme.link }, pressed && styles.pressed]}>{label}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
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
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  sourceLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.6,
  },
})

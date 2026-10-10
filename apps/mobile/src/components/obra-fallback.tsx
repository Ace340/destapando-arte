import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/lib/theme'

// The Historia dead-ends: "Obra no encontrada" (public truth gate — only
// published works exist) and "Algo falló" (fetch error).

export function ObraFallback({ title, body }: { title: string; body: string }) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.screen, { backgroundColor: theme.bg, padding: 24, paddingTop: insets.top + 40 }]}>
      <Text style={[styles.brand, { color: theme.faint }]}>Destapando el Arte</Text>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  brand: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 26,
  },
})

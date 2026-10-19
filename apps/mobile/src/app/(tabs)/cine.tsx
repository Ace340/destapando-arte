import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/lib/theme'

// GLOSSARY Cine (section): the browse list of Films with at least one
// published Film connection. Blank page for now — the section fills in
// when the Cine feature lands.

export default function Cine() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg, paddingTop: insets.top + 12 }]}>
      <Text style={[styles.brand, { color: theme.faint }]}>Destapando el Arte</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>Cine</Text>
      <View style={styles.empty}>
        <Text style={[styles.placeholder, { color: theme.muted }]}>Próximamente</Text>
        <Text style={[styles.hint, { color: theme.faint }]}>
          Las películas que le deben algo al arte
        </Text>
      </View>
    </View>
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 96,
  },
  placeholder: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 18,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
})

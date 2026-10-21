import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/lib/theme'

// Shared scaffold for the (tabs) section screens: themed background, top
// safe-area inset, and the brand + section-subtitle header. Absorbs the
// theme/inset wiring the four screens used to duplicate.

export function SectionScreen({
  subtitle,
  children,
}: {
  subtitle: string
  children?: ReactNode
}) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg, paddingTop: insets.top + 12 }]}>
      <Text style={[styles.brand, { color: theme.faint }]}>Destapando el Arte</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>{subtitle}</Text>
      {children}
    </View>
  )
}

// Centered empty state for sections whose feature hasn't landed yet
// (Cine, Favoritos) — honest placeholder copy, themed.

export function SectionEmpty({ title, hint }: { title: string; hint: string }) {
  const theme = useTheme()

  return (
    <View style={styles.empty}>
      <Text style={[styles.placeholder, { color: theme.muted }]}>{title}</Text>
      <Text style={[styles.hint, { color: theme.faint }]}>{hint}</Text>
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

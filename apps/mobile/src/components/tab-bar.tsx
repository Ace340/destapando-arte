import { Ionicons } from '@expo/vector-icons'
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect'
import { router, usePathname, type Href } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/lib/theme'

// Fixed bottom section bar (replaces the floating dock): the app's four
// sections as full-width edge-to-edge tabs — always visible, no
// hide-on-scroll. iOS 26+: real liquid glass. Other platforms: themed
// surface with a top hairline. Icons + labels; active state is color-only.
// Future sections append here — the bar grows, the screens don't change.

// Short-circuit before the native checks so the functions are never called
// on platforms where the module is absent.
const GLASS_OK =
  Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

const BAR_HEIGHT = 56

interface TabSection {
  label: string
  href: Href
  icon: keyof typeof Ionicons.glyphMap
}

// Sections (GLOSSARY): Descubre (the catalog wall), the Artistas section,
// the Cine section, and Favoritos (the user's local shelf of Obras).
const SECTIONS: TabSection[] = [
  { label: 'Descubre', href: '/', icon: 'compass' },
  { label: 'Artistas', href: '/artistas', icon: 'people' },
  { label: 'Cine', href: '/cine', icon: 'film' },
  { label: 'Favoritos', href: '/favoritos', icon: 'heart' },
]

export function TabBar() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const pathname = usePathname()

  return (
    <View
      style={[
        styles.bar,
        // Inset sits OUTSIDE the content height — otherwise the home
        // indicator zone eats into the 56px and clips the icon.
        { height: BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
      ]}
    >
      {GLASS_OK ? (
        <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular" />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.fallback,
            { backgroundColor: theme.surface, borderTopColor: theme.border },
          ]}
        />
      )}
      {SECTIONS.map((section) => {
        const active =
          section.href === '/' ? pathname === '/' : pathname.startsWith(String(section.href))
        const color = active ? theme.text : theme.muted
        return (
          <Pressable
            key={section.label}
            onPress={() => router.navigate(section.href)}
            accessibilityRole="tab"
            accessibilityLabel={section.label}
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Ionicons name={section.icon} size={24} color={color} />
            <Text style={[styles.label, { color }]}>{section.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fallback: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  itemPressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 0.2,
  },
})

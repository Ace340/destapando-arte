import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect'
import { router, usePathname, type Href } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/lib/theme'

// Floating section bar (ADR-0022 surfaces): bottom-center dock with the
// app's sections — Descubre (the catalog wall) and Artistas. Ducks away on
// scroll down, returns on scroll up, always visible at the top. iOS 26+:
// real liquid glass (translateY only — never opacity, which kills the
// effect, per expo-glass-effect docs). Other platforms: themed surface.

// Short-circuit before the native checks so the functions are never called
// on platforms where the module is absent.
const GLASS_OK =
  Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

const BAR_HEIGHT = 56
const BAR_GAP = 16
const TOGGLE_MS = 240

interface DockAction {
  label: string
  href: Href
}

// Sections today (GLOSSARY): the catalog and the Artistas section. Future
// sections append here — the bar grows, the screens don't change.
const ACTIONS: DockAction[] = [
  { label: 'Descubre', href: '/' },
  { label: 'Artistas', href: '/artistas' },
]

// Direction-aware hide-on-scroll. Small dead zones (±6) keep jitter from
// flinging the bar in and out; the top of any list pins it visible.
export function useDockScroll() {
  const hidden = useSharedValue(0)
  const lastY = useSharedValue(0)

  const onScroll = useAnimatedScrollHandler((event) => {
    const y = event.contentOffset.y
    const dy = y - lastY.value
    if (y < 8) hidden.value = 0
    else if (dy > 6) hidden.value = 1
    else if (dy < -6) hidden.value = 0
    lastY.value = y
  })

  return { onScroll, hidden }
}

export function FloatingDock({ hidden }: { hidden: SharedValue<number> }) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const pathname = usePathname()

  const slide = useAnimatedStyle(() => ({
    // Fully clears the screen edge: bar + gap + home-indicator zone.
    transform: [
      {
        translateY: withTiming(hidden.value * (BAR_HEIGHT + BAR_GAP + insets.bottom + 8), {
          duration: TOGGLE_MS,
        }),
      },
    ],
  }))

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.dock,
          slide,
          { marginBottom: insets.bottom + BAR_GAP },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.bar}>
          {GLASS_OK ? (
            <GlassView style={StyleSheet.absoluteFill} glassEffectStyle="regular" />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: theme.surface,
                  borderRadius: 28,
                  borderWidth: 1,
                  borderColor: theme.border,
                },
                Platform.OS === 'ios' ? styles.shadowIos : styles.shadowAndroid,
              ]}
            />
          )}
          {ACTIONS.map((action) => {
            const active =
              action.href === '/' ? pathname === '/' : pathname.startsWith(String(action.href))
            return (
              <Pressable
                key={action.label}
                onPress={() => router.push(action.href)}
                accessibilityRole="link"
                accessibilityLabel={action.label}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                  active && { backgroundColor: `${theme.text}14` },
                ]}
              >
                <Text style={[styles.itemLabel, { color: active ? theme.text : theme.muted }]}>
                  {action.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    gap: 4,
    height: BAR_HEIGHT,
    paddingHorizontal: 6,
    borderRadius: 28,
    overflow: 'hidden',
  },
  item: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  shadowIos: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  shadowAndroid: {
    elevation: 6,
  },
})

import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/lib/theme'

// Collapsing toolbar over the Hero (ADR-0020). iOS 26+: real liquid glass,
// animated through glassEffectStyle 'regular'↔'none' — never opacity, which
// kills the effect (expo-glass-effect docs). Other platforms: themed surface
// with a plain fade.

// Short-circuit before the native checks so the functions are never called
// on platforms where the module is absent.
const GLASS_OK =
  Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

export const HEADER_CONTENT_HEIGHT = 52

interface StoryHeaderProps {
  visible: boolean
  title: string
}

export function StoryHeader({ visible, title }: StoryHeaderProps) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 })
  }, [visible, opacity])

  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top, height: insets.top + HEADER_CONTENT_HEIGHT },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {GLASS_OK ? (
        <GlassView
          style={StyleSheet.absoluteFill}
          glassEffectStyle={{
            style: visible ? 'regular' : 'none',
            animate: true,
            animationDuration: 0.2,
          }}
        />
      ) : (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
            fade,
          ]}
        />
      )}
      <Animated.View style={[styles.row, fade]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Volver al catálogo"
          accessibilityRole="button"
        >
          {({ pressed }) => (
            <Text style={[styles.back, { color: theme.text, opacity: pressed ? 0.5 : 1 }]}>‹</Text>
          )}
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_CONTENT_HEIGHT,
    justifyContent: 'flex-end',
  },
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 4,
  },
  back: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: 'Inter_400Regular',
    marginTop: -4,
    minWidth: 28,
    textAlign: 'center',
  },
  title: {
    flex: 1,
    paddingRight: 28,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
})

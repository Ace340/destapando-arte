import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'

import { gradientStops, pickAccent } from '@/lib/theme'

// The art-first opening frame (ADR-0020, GLOSSARY Hero). The palette gradient
// is always the base layer — it is the loading placeholder and, for
// story-only works (las-dos-fridas, ADR-0003), the permanent hero.

interface HeroProps {
  source: string | null
  palette: readonly string[]
  title: string
  meta: string
  accentFallback: string
  height: number
  style?: StyleProp<AnimatedStyle<ViewStyle>>
}

export function Hero({ source, palette, title, meta, accentFallback, height, style }: HeroProps) {
  const accent = pickAccent(palette, accentFallback)
  return (
    <Animated.View style={[styles.frame, { height }, style]}>
      <LinearGradient
        colors={gradientStops(palette) as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />
      {source ? (
        <Image
          source={{ uri: source }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={350}
          accessible
          accessibilityLabel={title}
        />
      ) : null}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.62)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.caption}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <Text style={styles.title}>{title}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
  caption: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 20,
    gap: 6,
  },
  accentBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 30,
    lineHeight: 34,
    color: '#FFFFFF',
  },
  meta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
})

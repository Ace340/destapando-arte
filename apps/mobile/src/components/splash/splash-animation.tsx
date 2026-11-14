import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle, Defs, Polygon, RadialGradient, Rect, Stop, LinearGradient } from 'react-native-svg'
import { Image, Pressable, StyleSheet, Text, useColorScheme, useWindowDimensions } from 'react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'

import noisePng from '../../assets/images/noise.png'

import { SplashArtContent } from './artwork'
import {
  BLOBS,
  DARK_SCENE,
  LIGHT_SCENE,
  TIMING,
  VIEWBOX,
  createParticles,
  hillsPoints,
  type BlobConfig,
} from './scene'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedText = Animated.createAnimatedComponent(Text)

export interface SplashAnimationProps {
  /** Called once the animation has faded out; unmount to reveal the app. */
  readonly onFinish: () => void
}

/**
 * Animated splash ported from the motion-graphic HTML. Renders as an opaque
 * overlay: the native splash stays up for the first few frames, then the
 * animation plays and fades into the app. Tap anywhere to skip.
 */
export function SplashAnimation({ onFinish }: SplashAnimationProps) {
  const { width, height } = useWindowDimensions()
  const scheme = useColorScheme()
  const scene = scheme === 'dark' ? DARK_SCENE : LIGHT_SCENE

  const fade = useSharedValue(1)
  const [finishing, setFinishing] = useState(false)
  const finished = useRef(false)
  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    setFinishing(true)
  }, [])

  useEffect(() => {
    if (!finishing) return
    fade.value = withTiming(0, { duration: TIMING.fadeOut, easing: Easing.ease })
    const timer = setTimeout(onFinish, TIMING.fadeOut + 20)
    return () => clearTimeout(timer)
  }, [finishing, fade, onFinish])

  const particles = useMemo(() => createParticles(), [])
  const elapsed = useSharedValue(0)
  useFrameCallback((info) => {
    elapsed.value = info.timeSinceFirstFrame / 1000
  }, true)

  useEffect(() => {
    const hideNative = setTimeout(() => void SplashScreen.hideAsync(), TIMING.nativeSplashHide)
    const autoFinish = setTimeout(finish, TIMING.autoFinish)
    return () => {
      clearTimeout(hideNative)
      clearTimeout(autoFinish)
    }
  }, [finish])

  const artHeight = Math.round(height * 0.94)
  const artScale = Math.min(width / VIEWBOX.width, artHeight / VIEWBOX.height)
  const titleTop =
    (height - artHeight) / 2 + (artHeight - VIEWBOX.height * artScale) / 2 + 700 * artScale
  const titleFontSize = Math.round(46 * artScale)

  const blobGeometries = useMemo(
    () =>
      BLOBS.map((blob) => ({
        ...blob,
        cx: blob.cx * width,
        cy: blob.cy * height,
        r: blob.r * width,
      })),
    [width, height],
  )

  return (
    <Pressable style={styles.fill} onPress={finish}>
      <Animated.View style={[styles.fill, { opacity: fade }]}>
        <Svg width={width} height={height} style={styles.fill}>
          <Defs>
            <RadialGradient id="splash-bg" cx="50%" cy="55%" r="75%">
              <Stop offset="0" stopColor={scene.bg2} />
              <Stop offset="0.7" stopColor={scene.bg} />
              <Stop offset="1" stopColor={scene.bg} />
            </RadialGradient>
            <LinearGradient id="splash-hills" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#8a8a90" />
              <Stop offset="1" stopColor="#4a4a52" />
            </LinearGradient>
            {blobGeometries.map((blob, index) => (
              <RadialGradient key={blob.color} id={`splash-blob-${index}`}>
                <Stop offset="0.45" stopColor={blob.color} />
                <Stop offset="0.7" stopColor={blob.color} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          <Rect width={width} height={height} fill="url(#splash-bg)" />
          <Polygon points={hillsPoints(width, height)} fill="url(#splash-hills)" opacity={0.45} />
          {blobGeometries.map((blob, index) => (
            <SplashBlob key={blob.color} config={blob} gradientId={`splash-blob-${index}`} />
          ))}
        </Svg>

        <Svg
          width={width}
          height={artHeight}
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          style={[styles.art, { top: (height - artHeight) / 2 }]}
        >
          <SplashArtContent width={width} height={artHeight} particles={particles} elapsed={elapsed} />
        </Svg>

        <SplashTitle
          top={titleTop}
          fontSize={titleFontSize}
          rise={12 * artScale}
          color={scene.fg}
        />

        <Image source={noisePng} style={[styles.fill, styles.grain]} resizeMode="repeat" />
      </Animated.View>
    </Pressable>
  )
}

interface SplashBlobProps {
  /** Blob geometry converted to screen px. */
  readonly config: BlobConfig
  readonly gradientId: string
}

function SplashBlob({ config, gradientId }: SplashBlobProps) {
  const burst = useSharedValue(0)
  const opacityProgress = useSharedValue(0)

  useEffect(() => {
    const easing = Easing.bezier(0.1, 0.9, 0.25, 1)
    burst.value = withDelay(config.delay, withTiming(1, { duration: TIMING.blobBurst, easing }))
    opacityProgress.value = withDelay(
      config.delay,
      withSequence(
        withTiming(0.25, { duration: Math.round(TIMING.blobBurst * 0.25), easing }),
        withTiming(1, { duration: Math.round(TIMING.blobBurst * 0.75), easing }),
      ),
    )
  }, [config, burst, opacityProgress])

  const animatedProps = useAnimatedProps(() => ({
    scale: interpolate(burst.value, [0, 1], [0.001, 1], Extrapolation.CLAMP),
    opacity: interpolate(opacityProgress.value, [0, 0.25, 1], [0, 0.75, 0.5], Extrapolation.CLAMP),
    originX: config.cx,
    originY: config.cy,
  }))

  return (
    <AnimatedCircle
      cx={config.cx}
      cy={config.cy}
      r={config.r}
      fill={`url(#${gradientId})`}
      animatedProps={animatedProps}
    />
  )
}

interface SplashTitleProps {
  readonly top: number
  readonly fontSize: number
  /** Vertical distance the title travels while fading in (screen px). */
  readonly rise: number
  readonly color: string
}

function SplashTitle({ top, fontSize, rise, color }: SplashTitleProps) {
  const reveal = useSharedValue(0)

  useEffect(() => {
    reveal.value = withDelay(
      TIMING.titleDelay,
      withTiming(1, { duration: TIMING.titleFade, easing: Easing.ease }),
    )
  }, [reveal])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: interpolate(reveal.value, [0, 1], [rise, 0], Extrapolation.CLAMP) }],
  }))

  return (
    <AnimatedText
      style={[
        styles.title,
        { top: top - fontSize, fontSize, color, fontFamily: 'InstrumentSerif_400Regular', letterSpacing: 1.5 },
        animatedStyle,
      ]}
    >
      Destapando el Arte
    </AnimatedText>
  )
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  art: {
    position: 'absolute',
    left: 0,
  },
  grain: {
    opacity: 0.18,
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
})

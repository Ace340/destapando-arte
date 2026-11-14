import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'
import {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text,
} from 'react-native-svg'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import {
  CAN,
  ITEMS,
  LID,
  SWIRL,
  TIMING,
  segmentDurations,
  type ItemConfig,
  type SprayParticleConfig,
} from './scene'
import { SprayParticles } from './spray'

const AnimatedG = Animated.createAnimatedComponent(G)

// Spread the readonly tuples so reanimated's interpolate() accepts them.
const LID_KEYS = [...LID.keys]
const LID_TX = [...LID.tx]
const LID_TY = [...LID.ty]
const LID_ROTATION = [...LID.rotation]
const LID_SCALE_X = [...LID.scaleX]
const LID_SCALE_Y = [...LID.scaleY]
const CAN_KEYS = [...CAN.keys]

export interface SplashArtContentProps {
  readonly width: number
  readonly height: number
  readonly particles: readonly SprayParticleConfig[]
  readonly elapsed: SharedValue<number>
}

/**
 * The full scene inside the main viewBox (600x760): paint can, lid, swirl,
 * tools, and spray. `width`/`height` are the rendered SVG element size in
 * screen px; all coordinates inside stay in viewBox units.
 */
export function SplashArtContent(props: SplashArtContentProps) {
  return (
    <>
      <Defs>
        <RadialGradient id="splash-ground">
          <Stop offset="0" stopColor="#000" stopOpacity={0.32} />
          <Stop offset="1" stopColor="#000" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="splash-inner" cx="0.5" cy="0.3" r="0.8">
          <Stop offset="0" stopColor="#4a4658" />
          <Stop offset="1" stopColor="#14121a" />
        </RadialGradient>
        <LinearGradient id="splash-tin" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#7d818c" />
          <Stop offset="0.12" stopColor="#c6c9d1" />
          <Stop offset="0.3" stopColor="#fbfbfd" />
          <Stop offset="0.45" stopColor="#d4d7de" />
          <Stop offset="0.75" stopColor="#9da1ab" />
          <Stop offset="0.92" stopColor="#d0d3da" />
          <Stop offset="1" stopColor="#6d717b" />
        </LinearGradient>
        <LinearGradient id="splash-rib" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#000" stopOpacity={0.35} />
          <Stop offset="0.3" stopColor="#fff" stopOpacity={0} />
          <Stop offset="0.8" stopColor="#000" stopOpacity={0.25} />
          <Stop offset="1" stopColor="#000" stopOpacity={0.4} />
        </LinearGradient>
        <LinearGradient id="splash-orange" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#9c520c" />
          <Stop offset="0.3" stopColor="#ffcb5e" />
          <Stop offset="0.6" stopColor="#e8901f" />
          <Stop offset="1" stopColor="#7d3f08" />
        </LinearGradient>
        <LinearGradient id="splash-steel" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#6c707a" />
          <Stop offset="0.35" stopColor="#f7f8fa" />
          <Stop offset="0.7" stopColor="#9094a0" />
          <Stop offset="1" stopColor="#5d616b" />
        </LinearGradient>
        <LinearGradient id="splash-wood" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#5a3314" />
          <Stop offset="0.4" stopColor="#d49a5c" />
          <Stop offset="1" stopColor="#6e4120" />
        </LinearGradient>
        <LinearGradient id="splash-cyan" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7fe8ee" />
          <Stop offset="0.5" stopColor="#2fb0b9" />
          <Stop offset="1" stopColor="#14656c" />
        </LinearGradient>
        <LinearGradient id="splash-pink" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ff9bbf" />
          <Stop offset="0.5" stopColor="#e8306f" />
          <Stop offset="1" stopColor="#8e1040" />
        </LinearGradient>
        <LinearGradient id="splash-cam" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#eceef2" />
          <Stop offset="0.5" stopColor="#a9adb7" />
          <Stop offset="1" stopColor="#6f737d" />
        </LinearGradient>
        <RadialGradient id="splash-lens" cx="0.4" cy="0.35" r="0.7">
          <Stop offset="0" stopColor="#7d9cff" />
          <Stop offset="0.35" stopColor="#2b3f9c" />
          <Stop offset="0.75" stopColor="#0c1033" />
          <Stop offset="1" stopColor="#05060f" />
        </RadialGradient>
        <RadialGradient id="splash-reel" cx="0.4" cy="0.35" r="0.8">
          <Stop offset="0" stopColor="#fff" />
          <Stop offset="0.6" stopColor="#c6c9d1" />
          <Stop offset="1" stopColor="#7c808b" />
        </RadialGradient>
        <LinearGradient id="splash-bag" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#cfd5e0" stopOpacity={0.9} />
          <Stop offset="0.5" stopColor="#fff" stopOpacity={0.95} />
          <Stop offset="1" stopColor="#a9b1c2" stopOpacity={0.9} />
        </LinearGradient>
      </Defs>

      {/* Soft ground shadow (gaussian blur approximated with a radial fade). */}
      <Ellipse cx={300} cy={598} rx={140} ry={15} fill="url(#splash-ground)" />
      <Ellipse cx={300} cy={388} rx={105} ry={23} fill="url(#splash-inner)" />

      <SplashSwirl />
      <SplashItem config={ITEMS[0]}>{bagArt}</SplashItem>
      <SplashItem config={ITEMS[1]}>{paintTubeArt}</SplashItem>
      <SplashItem config={ITEMS[3]}>{brushArt}</SplashItem>
      <SplashItem config={ITEMS[4]}>{filmReelArt}</SplashItem>
      <SplashItem config={ITEMS[5]}>{cyanTubeArt}</SplashItem>
      <SplashItem config={ITEMS[6]}>{pinkTubeArt}</SplashItem>
      <SplashItem config={ITEMS[2]}>{cameraArt}</SplashItem>

      <SplashCan />
      <SplashLid />
      <SprayParticles particles={props.particles} elapsed={props.elapsed} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Animated groups
// ---------------------------------------------------------------------------

interface SplashItemProps {
  readonly config: ItemConfig
  readonly children: ReactNode
}

/** A tool that pops out of the can (staggered), then bobs gently forever. */
function SplashItem({ config, children }: SplashItemProps) {
  const pop = useSharedValue(0)
  const opacityProgress = useSharedValue(0)
  const bob = useSharedValue(0)

  useEffect(() => {
    const easing = Easing.bezier(0.3, 0.7, 0.3, 1)
    pop.value = withDelay(
      config.delay,
      withSequence(
        withTiming(0.55, { duration: Math.round(TIMING.itemPop * 0.55), easing }),
        withTiming(1, { duration: Math.round(TIMING.itemPop * 0.45), easing }),
      ),
    )
    opacityProgress.value = withDelay(
      config.delay,
      withSequence(
        withTiming(1, { duration: Math.round(TIMING.itemPop * 0.1), easing }),
        withTiming(1, { duration: Math.round(TIMING.itemPop * 0.45), easing }),
      ),
    )
    bob.value = withDelay(
      config.delay + TIMING.bobStartAfterPop,
      withRepeat(
        withTiming(1, { duration: TIMING.itemBob, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    )
  }, [config, pop, opacityProgress, bob])

  const animatedProps = useAnimatedProps(() => ({
    opacity: interpolate(opacityProgress.value, [0, 0.1, 1], [0, 1, 1], Extrapolation.CLAMP),
    translateX: interpolate(pop.value, [0, 0.55, 1], [0, config.shiftX, 0], Extrapolation.CLAMP),
    translateY:
      interpolate(pop.value, [0, 0.55, 1], [170, config.overshoot, 0], Extrapolation.CLAMP) +
      interpolate(bob.value, [0, 1], [0, -7]),
    scale: interpolate(pop.value, [0, 0.55, 1], [0.5, 1.06, 1], Extrapolation.CLAMP),
    rotation:
      interpolate(pop.value, [0, 0.55, 1], [0, config.rotation * 1.8, config.rotation], Extrapolation.CLAMP) +
      interpolate(bob.value, [0, 1], [0, 1.5]),
    originX: config.originX,
    originY: config.originY,
  }))

  return <AnimatedG animatedProps={animatedProps}>{children}</AnimatedG>
}

/** Squash-and-stretch bounce of the can when the lid flies off. */
function SplashCan() {
  const squash = useSharedValue(0)

  useEffect(() => {
    const easing = Easing.out(Easing.quad)
    squash.value = withDelay(
      TIMING.canSquashDelay,
      withSequence(
        withTiming(0.25, { duration: Math.round(TIMING.canSquash * 0.25), easing }),
        withTiming(0.6, { duration: Math.round(TIMING.canSquash * 0.35), easing }),
        withTiming(1, { duration: Math.round(TIMING.canSquash * 0.4), easing }),
      ),
    )
  }, [squash])

  const animatedProps = useAnimatedProps(() => ({
    scaleX: interpolate(squash.value, CAN_KEYS, [1, 1.035, 0.99, 1], Extrapolation.CLAMP),
    scaleY: interpolate(squash.value, CAN_KEYS, [1, 0.955, 1.02, 1], Extrapolation.CLAMP),
    originX: CAN.originX,
    originY: CAN.originY,
  }))

  return <AnimatedG animatedProps={animatedProps}>{canArt}</AnimatedG>
}

/** The lid wobbles, tips, and flies offscreen, fading as it goes. */
function SplashLid() {
  const flight = useSharedValue(0)
  const opacityProgress = useSharedValue(0)

  useEffect(() => {
    const easing = Easing.bezier(0.4, 0, 0.6, 1)
    const durations = segmentDurations(TIMING.lidOpen, LID.segments)
    const targets = LID_KEYS.slice(1)
    flight.value = withDelay(
      TIMING.lidDelay,
      withSequence(
        ...targets.map((target, i) =>
          withTiming(target, { duration: durations[i] ?? 0, easing }),
        ),
      ),
    )
    opacityProgress.value = withDelay(
      TIMING.lidDelay,
      withSequence(
        withTiming(1, { duration: Math.round(TIMING.lidOpen * 0.55) }),
        withTiming(0, { duration: Math.round(TIMING.lidOpen * 0.45) }),
      ),
    )
  }, [flight, opacityProgress])

  const animatedProps = useAnimatedProps(() => ({
    translateX: interpolate(flight.value, LID_KEYS, LID_TX, Extrapolation.CLAMP),
    translateY: interpolate(flight.value, LID_KEYS, LID_TY, Extrapolation.CLAMP),
    rotation: interpolate(flight.value, LID_KEYS, LID_ROTATION, Extrapolation.CLAMP),
    scaleX: interpolate(flight.value, LID_KEYS, LID_SCALE_X, Extrapolation.CLAMP),
    scaleY: interpolate(flight.value, LID_KEYS, LID_SCALE_Y, Extrapolation.CLAMP),
    opacity: interpolate(opacityProgress.value, [...LID.opacityKeys], [1, 0], Extrapolation.CLAMP),
    originX: LID.originX,
    originY: LID.originY,
  }))

  return <AnimatedG animatedProps={animatedProps}>{lidArt}</AnimatedG>
}

/** Paint swirl rising out of the open can. */
function SplashSwirl() {
  const rise = useSharedValue(0)

  useEffect(() => {
    rise.value = withDelay(
      TIMING.swirlDelay,
      withTiming(1, { duration: TIMING.swirlRise, easing: Easing.bezier(0.2, 0.8, 0.3, 1) }),
    )
  }, [rise])

  const animatedProps = useAnimatedProps(() => ({
    scaleY: interpolate(rise.value, [0, 1], [0.001, 1]),
    opacity: rise.value,
    originX: SWIRL.originX,
    originY: SWIRL.originY,
  }))

  return <AnimatedG animatedProps={animatedProps}>{swirlArt}</AnimatedG>
}

// ---------------------------------------------------------------------------
// Static artwork (verbatim paths from the source HTML)
// ---------------------------------------------------------------------------

const swirlArt = (
  <G fill="none" strokeLinecap="round">
    <Path d="M212 390q28-46 48-6t46-6 46 6 40-34" stroke="#1fb8aa" strokeWidth={14} />
    <Path d="M225 396q30-34 52 0t46-6 46 6 25-24" stroke="#e8306f" strokeWidth={12} />
    <Path d="M235 382q25-28 46-6t46-6 36 0" stroke="#ffb020" strokeWidth={11} />
    <Path d="M250 374q20-22 40 0t40-6" stroke="#7bd957" strokeWidth={9} />
    <Path d="M215 388q28-46 48-6" stroke="#fff" strokeOpacity={0.5} strokeWidth={3} />
  </G>
)

const bagArt = (
  <G>
    <Path d="M214 336q-30-34 2-70 10-16 34-12 12 8 24 22l4 58z" fill="url(#splash-bag)" stroke="#6c7385" strokeWidth={2.5} />
    <Path d="M224 300q-6 20 6 40" stroke="#fff" strokeWidth={5} fill="none" opacity={0.8} />
    <Path d="M216 268q-22-10-12-26 12-8 26 8" fill="none" stroke="#7b8296" strokeWidth={5} />
    <Path d="M232 330q16 6 34-2l6 8q-24 10-42 0z" fill="#e8306f" opacity={0.5} />
  </G>
)

const paintTubeArt = (
  <G>
    <Rect x={262} y={212} width={62} height={96} rx={8} fill="url(#splash-orange)" stroke="#3a2008" strokeWidth={2.5} />
    <Rect x={258} y={206} width={70} height={18} rx={4} fill="url(#splash-steel)" stroke="#3a2008" strokeWidth={2.5} />
    <Rect x={258} y={296} width={70} height={14} rx={4} fill="url(#splash-steel)" stroke="#3a2008" strokeWidth={2.5} />
    <Rect x={274} y={236} width={38} height={44} rx={3} fill="#fff4cf" opacity={0.92} />
    <Text x={293} y={264} fontSize={15} textAnchor="middle" fill="#7a3b05" fontFamily="monospace" fontWeight="bold">
      888
    </Text>
    <Path d="M324 212l16 10-2 70-14 6z" fill="#2a1c10" />
  </G>
)

const brushArt = (
  <G>
    <Path d="M346 150q-8 26-2 52l24-4q6-26-2-54z" fill="#2a9d95" stroke="#18312f" strokeWidth={2.5} />
    <Path d="M350 156q-4 18 0 36" stroke="#e8306f" strokeWidth={5} fill="none" />
    <Path d="M356 158q8 10 4 34" stroke="#ffb020" strokeWidth={5} fill="none" />
    <Path d="M344 202l26-5-3 26-24 5z" fill="url(#splash-steel)" stroke="#3b3f48" strokeWidth={2.5} />
    <Path d="M345 222l22-5 6 100q2 12-8 14t-14-12z" fill="url(#splash-wood)" stroke="#3a2008" strokeWidth={2.5} transform="translate(-2 6)" />
  </G>
)

const filmReelArt = (
  <G>
    <Circle cx={440} cy={270} r={47} fill="url(#splash-reel)" stroke="#2b2735" strokeWidth={3.5} />
    <Circle cx={440} cy={270} r={40} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={2} />
    <G fill="#1b1a22">
      <Circle cx={440} cy={270} r={10} />
      <Circle cx={440} cy={243} r={10} />
      <Circle cx={440} cy={297} r={10} />
      <Circle cx={413} cy={270} r={10} />
      <Circle cx={467} cy={270} r={10} />
    </G>
    <Circle cx={440} cy={270} r={3.5} fill="#9a9ea9" />
  </G>
)

const cyanTubeArt = (
  <G>
    <Path d="M358 292h74l12 4v22l-12 4h-74q-8-15 0-30z" fill="url(#splash-cyan)" stroke="#0f3b3f" strokeWidth={2.5} />
    <Rect x={440} y={294} width={22} height={26} rx={3} fill="url(#splash-steel)" stroke="#3b3f48" strokeWidth={2.5} />
    <Path d="M366 296h66" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} />
    <Text x={378} y={313} fontSize={13} fill="#0b2c30" fontFamily="sans-serif" fontWeight="bold">
      Cian
    </Text>
  </G>
)

const pinkTubeArt = (
  <G>
    <Path d="M372 338h76l12 4v22l-12 4h-76q-8-15 0-30z" fill="url(#splash-pink)" stroke="#4a0a22" strokeWidth={2.5} />
    <Rect x={458} y={340} width={22} height={26} rx={3} fill="url(#splash-steel)" stroke="#3b3f48" strokeWidth={2.5} />
    <Path d="M380 342h66" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} />
  </G>
)

const cameraArt = (
  <G>
    <Rect x={236} y={316} width={128} height={82} rx={10} fill="url(#splash-cam)" stroke="#2b2735" strokeWidth={3} />
    <Rect x={242} y={338} width={116} height={54} rx={6} fill="#26262c" />
    <Rect x={236} y={316} width={128} height={22} rx={9} fill="#e9ebef" stroke="#2b2735" strokeWidth={3} />
    <Rect x={248} y={306} width={22} height={12} rx={3} fill="#8d919b" stroke="#2b2735" strokeWidth={2} />
    <Circle cx={342} cy={327} r={5} fill="#e83a3a" />
    <Circle cx={300} cy={360} r={33} fill="url(#splash-steel)" stroke="#2b2735" strokeWidth={3} />
    <Circle cx={300} cy={360} r={27} fill="url(#splash-lens)" stroke="#05060f" strokeWidth={3} />
    <Circle cx={300} cy={360} r={14} fill="none" stroke="#6a7de0" strokeOpacity={0.5} strokeWidth={2} />
    <Ellipse cx={290} cy={349} rx={9} ry={5} fill="#fff" opacity={0.85} transform="rotate(-35 290 349)" />
    <Circle cx={311} cy={372} r={3} fill="#ff8ab5" opacity={0.7} />
  </G>
)

const canArt = (
  <G>
    <Path d="M195 388Q300 432 405 388V548Q405 592 300 592T195 548Z" fill="url(#splash-tin)" stroke="#3a3744" strokeWidth={3} />
    <Path d="M195 388Q300 432 405 388V548Q405 592 300 592T195 548Z" fill="url(#splash-rib)" />
    <G fill="none">
      <Path d="M197 428Q300 470 403 428" stroke="#fff" strokeOpacity={0.75} strokeWidth={3} />
      <Path d="M197 433Q300 475 403 433" stroke="#000" strokeOpacity={0.28} strokeWidth={3} />
      <Path d="M197 464Q300 506 403 464" stroke="#fff" strokeOpacity={0.75} strokeWidth={3} />
      <Path d="M197 469Q300 511 403 469" stroke="#000" strokeOpacity={0.28} strokeWidth={3} />
      <Path d="M197 500Q300 542 403 500" stroke="#fff" strokeOpacity={0.75} strokeWidth={3} />
      <Path d="M197 505Q300 547 403 505" stroke="#000" strokeOpacity={0.28} strokeWidth={3} />
      <Path d="M197 534Q300 576 403 534" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} />
      <Path d="M197 539Q300 581 403 539" stroke="#000" strokeOpacity={0.28} strokeWidth={3} />
    </G>
    <Path d="M195 388Q300 432 405 388" fill="none" stroke="#fff" strokeWidth={5} strokeOpacity={0.9} />
    <Path d="M195 388Q300 432 405 388" fill="none" stroke="#2a2733" strokeWidth={2} />
    <Path d="M230 410v150" stroke="#fff" strokeOpacity={0.5} strokeWidth={6} strokeLinecap="round" />
    <Ellipse cx={300} cy={470} rx={70} ry={4} fill="#e8306f" opacity={0.12} />
  </G>
)

const lidArt = (
  <G>
    <Ellipse cx={300} cy={388} rx={108} ry={25} fill="url(#splash-steel)" stroke="#2b2735" strokeWidth={3.5} />
    <Ellipse cx={300} cy={388} rx={84} ry={17} fill="none" stroke="#2b2735" strokeOpacity={0.5} strokeWidth={2} />
    <Ellipse cx={300} cy={386} rx={80} ry={15} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={2} />
    <Ellipse cx={272} cy={387} rx={28} ry={7} fill="#b7bbc5" stroke="#2b2735" strokeWidth={2.5} />
    <Circle cx={244} cy={386} r={10} fill="none" stroke="#868a95" strokeWidth={4} />
    <Circle cx={244} cy={386} r={10} fill="none" stroke="#2b2735" strokeWidth={1.2} />
  </G>
)

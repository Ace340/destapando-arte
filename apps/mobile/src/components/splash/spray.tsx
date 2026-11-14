import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated'
import { Circle } from 'react-native-svg'

import { SPRAY_FADE_RATE, SPRAY_GRAVITY, type SprayParticleConfig } from './scene'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface SprayParticlesProps {
  readonly particles: readonly SprayParticleConfig[]
  /** Seconds since the splash animation started. */
  readonly elapsed: SharedValue<number>
}

/** Physics-driven paint spray bursting from the can mouth. */
export function SprayParticles({ particles, elapsed }: SprayParticlesProps) {
  return (
    <>
      {particles.map((particle, index) => (
        <SprayParticle key={index} config={particle} elapsed={elapsed} />
      ))}
    </>
  )
}

interface SprayParticleProps {
  readonly config: SprayParticleConfig
  readonly elapsed: SharedValue<number>
}

// Time-based physics (pos = p0 + v·t + ½g·t²) so the arc is identical at
// 60/90/120Hz, unlike the frame-stepped original.
function SprayParticle({ config, elapsed }: SprayParticleProps) {
  const animatedProps = useAnimatedProps(() => {
    const t = Math.max(0, elapsed.value - config.delay)
    return {
      cx: config.x0 + config.vx * t,
      cy: config.y0 + config.vy * t + 0.5 * SPRAY_GRAVITY * t * t,
      opacity: t <= 0 ? 0 : Math.max(0, 1 - SPRAY_FADE_RATE * t),
    }
  })

  return (
    <AnimatedCircle
      cx={config.x0}
      cy={config.y0}
      r={config.radius}
      fill={config.color}
      animatedProps={animatedProps}
    />
  )
}

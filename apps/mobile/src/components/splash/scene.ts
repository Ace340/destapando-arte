// Scene data for the animated splash, ported from the motion-graphic HTML
// (assets/splash/Destapando el Arte2.html). All values are pure data so the
// animated components stay declarative and the choreography stays testable.

export const VIEWBOX = { width: 600, height: 760 } as const

export const LIGHT_SCENE = {
  bg: '#e9e8e2',
  bg2: '#fbfaf6',
  fg: '#1d1a26',
} as const

export const DARK_SCENE = {
  bg: '#15141a',
  bg2: '#2c2a33',
  fg: '#f1eee6',
} as const

// ms. AUTO_FINISH fires once the title has settled; the fade-out then hands
// off to the app. Native splash hides shortly after the overlay first paints.
export const TIMING = {
  blobBurst: 1400,
  itemPop: 1500,
  itemBob: 4000,
  bobStartAfterPop: 1600,
  swirlRise: 1400,
  swirlDelay: 1200,
  lidOpen: 2400,
  lidDelay: 200,
  canSquash: 700,
  canSquashDelay: 1000,
  titleDelay: 3000,
  titleFade: 1800,
  autoFinish: 4900,
  fadeOut: 450,
  nativeSplashHide: 150,
} as const

export interface BlobConfig {
  readonly delay: number
  /** Fractions of screen width/height (center + radius, radius relative to width). */
  readonly cx: number
  readonly cy: number
  readonly r: number
  readonly color: string
}

export const BLOBS: readonly BlobConfig[] = [
  { delay: 1100, cx: 0.4, cy: 0.31, r: 0.3, color: '#ff4f87' },
  { delay: 1200, cx: 0.57, cy: 0.295, r: 0.35, color: '#1fb8aa' },
  { delay: 1300, cx: 0.4725, cy: 0.644, r: 0.3125, color: '#ffb020' },
  { delay: 1150, cx: 0.5725, cy: 0.616, r: 0.2875, color: '#6a4cff' },
  { delay: 1400, cx: 0.63, cy: 0.145, r: 0.25, color: '#7bd957' },
  { delay: 1350, cx: 0.2125, cy: 0.606, r: 0.2125, color: '#ff7a2f' },
  { delay: 1250, cx: 0.775, cy: 0.6525, r: 0.225, color: '#3aa0ff' },
] as const

export interface ItemConfig {
  readonly delay: number
  /** Rest rotation in degrees. */
  readonly rotation: number
  /** Peak upward overshoot in viewBox units (negative = up). */
  readonly overshoot: number
  /** Mid-flight horizontal drift in viewBox units. */
  readonly shiftX: number
  /** Bottom-center origin used for scale/rotation, in viewBox units. */
  readonly originX: number
  readonly originY: number
}

export const ITEMS: readonly ItemConfig[] = [
  { delay: 1150, rotation: 0, overshoot: -60, shiftX: 0, originX: 246, originY: 340 },
  { delay: 1200, rotation: -8, overshoot: -90, shiftX: -20, originX: 293, originY: 310 },
  { delay: 1300, rotation: -4, overshoot: -70, shiftX: 0, originX: 300, originY: 395 },
  { delay: 1350, rotation: 10, overshoot: -120, shiftX: 10, originX: 357, originY: 340 },
  { delay: 1500, rotation: 6, overshoot: -100, shiftX: 20, originX: 440, originY: 317 },
  { delay: 1450, rotation: -52, overshoot: -90, shiftX: 30, originX: 410, originY: 322 },
  { delay: 1600, rotation: -32, overshoot: -80, shiftX: 30, originX: 418, originY: 370 },
] as const

export const LID = {
  originX: 300,
  originY: 388,
  keys: [0, 0.08, 0.12, 0.16, 0.2, 0.3, 0.55, 1] as const,
  tx: [0, 0, 0, 0, 0, 8, 70, 160] as const,
  ty: [0, 0, -3, 0, -5, -50, -210, -120] as const,
  rotation: [0, 0, -2, 2, -1.5, -14, 20, 150] as const,
  scaleX: [1, 1, 1, 1, 1.01, 1, 1, 1] as const,
  scaleY: [1, 1, 1, 1, 1, 0.8, 0.45, 0.7] as const,
  /** Fractions of LID duration between consecutive keys. */
  segments: [0.08, 0.04, 0.04, 0.04, 0.1, 0.25, 0.45] as const,
  opacityKeys: [0.55, 1] as const,
} as const

export const CAN = { originX: 300, originY: 592, keys: [0, 0.25, 0.6, 1] as const } as const
export const SWIRL = { originX: 300, originY: 402 } as const

export const SPRAY_GRAVITY = 1620 // viewBox units/s² (0.45/frame² at 60fps)
export const SPRAY_FADE_RATE = 0.72 // per second (0.012/frame at 60fps)

export const SPRAY_COLORS: readonly string[] = [
  '#e8306f',
  '#1fb8aa',
  '#ffb020',
  '#6a4cff',
  '#7bd957',
  '#3aa0ff',
]

export interface SprayParticleConfig {
  readonly x0: number
  readonly y0: number
  readonly vx: number
  readonly vy: number
  readonly radius: number
  readonly delay: number
  readonly color: string
}

export function createParticles(count = 46): SprayParticleConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5
    const speed = (9 + Math.random() * 10) * 60 // units/frame → units/s
    return {
      x0: 230 + Math.random() * 140,
      y0: 386,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 5,
      delay: 1.2 + Math.random() * 0.4,
      color: SPRAY_COLORS[i % SPRAY_COLORS.length] ?? '#e8306f',
    }
  })
}

/** Bottom hill silhouette as a polygon points string in screen coords. */
export function hillsPoints(width: number, height: number): string {
  const bandTop = height * 0.8
  const band = height * 0.2
  const peaks: readonly (readonly [number, number])[] = [
    [0, 0.4],
    [0.15, 0.25],
    [0.35, 0.38],
    [0.55, 0.18],
    [0.78, 0.34],
    [1, 0.15],
  ]
  const crest = peaks.map(([fx, fy]) => `${fx * width},${bandTop + fy * band}`).join(' ')
  return `0,${bandTop} ${crest} ${width},${height} 0,${height}`
}

/** Segment durations (ms) for a keyframe track that eases per interval. */
export function segmentDurations(total: number, fractions: readonly number[]): number[] {
  return fractions.map((f) => Math.round(total * f))
}

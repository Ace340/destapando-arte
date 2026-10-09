import { useColorScheme } from 'react-native'

// ADR-0020: adaptive light/dark. Zinc neutrals keep parity with the editorial
// look the scaffold shipped; per-artwork accent color comes from the palette
// (pickAccent — glossary: Obra del día), these tokens are only the neutrals.

export interface Theme {
  bg: string
  surface: string
  card: string
  border: string
  text: string
  body: string
  muted: string
  faint: string
  accentFallback: string
  link: string
  episode: string
}

const LIGHT: Theme = {
  bg: '#FFFFFF',
  surface: '#FAFAFA',
  card: '#FFFFFF',
  border: '#E4E4E7',
  text: '#18181B',
  body: '#27272A',
  muted: '#52525B',
  faint: '#A1A1AA',
  accentFallback: '#B91C1C',
  link: '#0369A1',
  episode: '#B91C1C',
}

const DARK: Theme = {
  bg: '#09090B',
  surface: '#18181B',
  card: '#18181B',
  border: '#27272A',
  text: '#FAFAFA',
  body: '#D4D4D8',
  muted: '#A1A1AA',
  faint: '#71717A',
  accentFallback: '#F87171',
  link: '#7DD3FC',
  episode: '#DC2626',
}

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? DARK : LIGHT
}

// --- palette helpers --------------------------------------------------------

// LinearGradient needs ≥ 2 stops; palettes carry 0–5 hexes.
export function gradientStops(palette: readonly string[]): string[] {
  if (palette.length === 0) return ['#27272A', '#09090B']
  if (palette.length === 1) return [palette[0], palette[0]]
  return [...palette]
}

interface SatLum {
  s: number
  l: number
}

function hexToSatLum(hex: string): SatLum | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const raw = match[1]
  const r = parseInt(raw.slice(0, 2), 16) / 255
  const g = parseInt(raw.slice(2, 4), 16) / 255
  const b = parseInt(raw.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  return { s, l }
}

// Pure: the most saturated palette color that is neither near-black nor
// near-white — one that can actually carry the accent role. Falls back when
// the palette is empty or all neutrals.
export function pickAccent(palette: readonly string[], fallback: string): string {
  let best: string | null = null
  let bestSaturation = 0.15
  for (const hex of palette) {
    const satLum = hexToSatLum(hex)
    if (!satLum) continue
    if (satLum.l < 0.1 || satLum.l > 0.9) continue
    if (satLum.s > bestSaturation) {
      bestSaturation = satLum.s
      best = hex
    }
  }
  return best ?? fallback
}

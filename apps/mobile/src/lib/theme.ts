import { useColorScheme } from 'react-native'

// ADR-0020: adaptive light/dark. Zinc neutrals keep parity with the editorial
// look the scaffold shipped. These tokens are only the neutrals — the
// per-artwork accent color math lives in lib/palette.ts.

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

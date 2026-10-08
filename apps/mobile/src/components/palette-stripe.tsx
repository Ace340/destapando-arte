import { StyleSheet, View } from 'react-native'

// Palette theming per the glossary (obra del día takes accent colors from the
// painting's palette). Renders as a stripe of the artwork's own hexes; works
// with zero images, which is how rights-blocked obras (las-dos-fridas,
// ADR-0003) and the whole scaffold ship.
export function PaletteStripe({ palette, height = 6 }: { palette: string[]; height?: number }) {
  if (palette.length === 0) return null
  return (
    <View style={[styles.stripe, { height }]}>
      {palette.map((hex) => (
        <View key={hex} style={[styles.swatch, { backgroundColor: hex }]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  stripe: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  swatch: {
    flex: 1,
  },
})

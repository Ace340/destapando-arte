import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { CityImage } from '@/components/city-image'
import { GUTTER } from '@/components/section-screen'
import { type CityListRow } from '@/lib/cities'
import { useTheme } from '@/lib/theme'

// A card on the Ciudades scroll (ADR-0024): the Descubre wall's shape
// (ADR-0020) at half the art height — a wide city picture (the editor's
// optional Commons link, ADR-0008) or the monogram placeholder scaled up,
// the name beneath, tap to open the Ciudad. No chevron, no separators:
// the caption's padding sets the rhythm, like the catalog.

export function CityCard({ city }: { city: CityListRow }) {
  const theme = useTheme()
  const { width, height } = useWindowDimensions()
  const imageWidth = Math.round(width - GUTTER * 2)
  const imageHeight = Math.round(height * 0.36)

  return (
    <Link href={{ pathname: '/ciudad/[slug]', params: { slug: city.slug } }} asChild>
      <Pressable style={({ pressed }) => (pressed ? styles.pressed : null)}>
        <CityImage
          imageUrl={city.image_url}
          name={city.name}
          width={imageWidth}
          height={imageHeight}
          radius={16}
          recyclingKey={city.id}
        />
        <View style={styles.caption}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
            {city.name}
          </Text>
        </View>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  caption: {
    paddingTop: 12,
    paddingBottom: 32,
  },
  name: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 24,
  },
})

import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { CityImage } from '@/components/city-image'
import { lugarCount, type CityListRow } from '@/lib/cities'
import { useTheme } from '@/lib/theme'

// Ciudad list row (ADR-0024) + the list separator, extracted from the
// Ciudades route. The separator is a module-scope component so FlatList
// sees one stable type — an inline arrow remounts separators on every
// re-render. Same shape as the artist row (artist-row.tsx), minus the
// Sello: the city picture is the editor's optional Commons link (ADR-0008)
// or the initial monogram placeholder (city-image.tsx).

export function CityRowItem({ city }: { city: CityListRow }) {
  const theme = useTheme()
  const count = lugarCount(city)
  const meta = `${count} ${count === 1 ? 'lugar' : 'lugares'}`

  return (
    <Link href={{ pathname: '/ciudad/[slug]', params: { slug: city.slug } }} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <CityImage
          imageUrl={city.image_url}
          name={city.name}
          width={48}
          height={48}
          radius={9999}
          recyclingKey={city.id}
        />
        <View style={styles.rowText}>
          <Text style={[styles.name, { color: theme.text }]}>{city.name}</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>{meta}</Text>
        </View>
        <Text style={[styles.chevron, { color: theme.faint }]}>›</Text>
      </Pressable>
    </Link>
  )
}

export function CitySeparator() {
  const theme = useTheme()
  return <View style={[styles.separator, { backgroundColor: theme.border }]} />
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  chevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
  },
  separator: {
    height: 1,
  },
})

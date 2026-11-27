import { Link } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { ArtworkThumb } from '@/components/artwork-thumb'
import { type StyleChipRow } from '@/lib/styles'
import { useTheme } from '@/lib/theme'

// The Estilos strip (ADR-0025): a horizontal carousel of chips inserted
// after the third wall card on Descubre — it scrolls with the wall, never
// sticky. Each chip is the style's representative obra (ADR-0023
// derivation; a gradient-only chip when the style has no published obra
// with an image) with the style name (Es) beneath. Single-select: a tap
// routes to the style's browse list. «Sin clasificar» rides last as the
// dev-time chip (ADR-0025) — it retires at full coverage.

const CHIP = 88

export function StyleStrip({ chips }: { chips: StyleChipRow[] }) {
  const theme = useTheme()
  if (chips.length === 0) return null

  return (
    <View style={styles.strip}>
      <Text style={[styles.label, { color: theme.faint }]}>Estilos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {chips.map((style) => (
          <Link
            key={style.id}
            href={{ pathname: '/estilo/[slug]', params: { slug: style.slug } }}
            asChild
          >
            <PressableChip chip={style} />
          </Link>
        ))}
      </ScrollView>
    </View>
  )
}

function PressableChip({ chip }: { chip: StyleChipRow }) {
  const theme = useTheme()
  return (
    <Pressable style={({ pressed }) => (pressed ? styles.pressed : null)}>
      <ArtworkThumb
        source={chip.representative?.source ?? null}
        palette={chip.representative?.palette ?? []}
        slug={chip.slug}
        size={CHIP}
      />
      <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
        {chip.name}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  strip: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  label: {
    marginBottom: 12,
    paddingLeft: 24, // the chips' gutter — flush-left looked broken against them
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  row: {
    gap: 16,
    paddingHorizontal: 24, // the scaffold's 24pt gutters, matching the wall cards
  },
  chip: {
    width: CHIP,
    gap: 6,
  },
  pressed: {
    opacity: 0.6,
  },
  name: {
    textAlign: 'center',
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 15,
  },
})

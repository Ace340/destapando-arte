import { StyleSheet, Text, View } from 'react-native'

import type { CuriosityType } from '@/lib/types'

// Labels match the dashboard badge (apps/dashboard/src/components/badges.tsx)
// and the glossary: 'mito destapado' is the debunk tier.
const STYLES: Record<CuriosityType, { label: string; backgroundColor: string; color: string }> = {
  fact: { label: 'dato', backgroundColor: '#D1FAE5', color: '#065F46' },
  myth: { label: 'mito destapado', backgroundColor: '#FAE8FF', color: '#86198F' },
  legend: { label: 'leyenda', backgroundColor: '#E4E4E7', color: '#3F3F46' },
}

export function CuriosityBadge({ type }: { type: CuriosityType }) {
  const style = STYLES[type]
  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, { color: style.color }]}>{style.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
})

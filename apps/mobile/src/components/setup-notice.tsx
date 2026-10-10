import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/lib/theme'

// Shown when Supabase env vars are missing — mirrors the dashboard's
// SetupNotice pattern with the mobile-specific steps.
const STEPS: readonly string[] = [
  'Arranca el stack local: Docker Desktop → supabase start.',
  'Copia la anon key de `supabase status` (la clave publicada, no la secret).',
  'Crea apps/mobile/.env con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  'En el emulador Android la URL es http://10.0.2.2:54321 (no localhost).',
  'Reinicia el servidor (`npx expo start`) y vuelve a abrir la app.',
]

export function SetupNotice() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.bg,
          paddingTop: insets.top + 40,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>Conecta Supabase</Text>
      <Text style={[styles.lead, { color: theme.muted }]}>
        La app necesita su base de datos. Cinco pasos y estás dentro:
      </Text>
      <View style={styles.steps}>
        {STEPS.map((step) => (
          <Text key={step} style={[styles.step, { color: theme.body }]}>
            {'\u2022'} {step}
          </Text>
        ))}
      </View>
      <Text style={[styles.note, { color: theme.faint }]}>
        La clave anon respeta RLS: la app solo ve obras publicadas y nunca escribe directo.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  lead: {
    fontSize: 15,
  },
  steps: {
    gap: 10,
    marginTop: 8,
  },
  step: {
    fontSize: 15,
    lineHeight: 22,
  },
  note: {
    fontSize: 13,
    marginTop: 8,
  },
})

import { StyleSheet, Text, View } from 'react-native'

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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conecta Supabase</Text>
      <Text style={styles.lead}>La app necesita su base de datos. Cinco pasos y estás dentro:</Text>
      <View style={styles.steps}>
        {STEPS.map((step) => (
          <Text key={step} style={styles.step}>
            {'\u2022'} {step}
          </Text>
        ))}
      </View>
      <Text style={styles.note}>
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
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#18181B',
  },
  lead: {
    fontSize: 15,
    color: '#52525B',
  },
  steps: {
    gap: 10,
    marginTop: 8,
  },
  step: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3F3F46',
  },
  note: {
    fontSize: 13,
    color: '#A1A1AA',
    marginTop: 8,
  },
})

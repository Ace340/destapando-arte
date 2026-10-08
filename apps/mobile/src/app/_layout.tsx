import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

// Spanish, light-only — parity with the public web pages (ADR-0009).
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="obra/[slug]" />
      </Stack>
    </>
  )
}

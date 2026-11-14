import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces'
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif'
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { SplashAnimation } from '@/components/splash/splash-animation'
import { useTheme } from '@/lib/theme'

// Spanish UI (ADR-0009), adaptive light/dark + editorial fonts (ADR-0020).
// Fonts load at runtime — Expo Go compatible; switch to the expo-font config
// plugin when a development build arrives. The animated splash overlay plays
// once fonts are ready; it hides the native splash itself and calls back when
// the fade-out completes.

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const scheme = useColorScheme()
  const theme = useTheme()
  const [splashDone, setSplashDone] = useState(false)
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    InstrumentSerif_400Regular,
    Inter_400Regular,
    Inter_500Medium,
  })

  useEffect(() => {
    if (error) void SplashScreen.hideAsync()
  }, [error])

  if (!loaded && !error) return null

  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="obra/[slug]" />
        <Stack.Screen name="artista/[slug]" />
        <Stack.Screen name="ciudad/[slug]" />
      </Stack>
      {!splashDone && <SplashAnimation onFinish={() => setSplashDone(true)} />}
    </SafeAreaProvider>
  )
}

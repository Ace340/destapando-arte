import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces'
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useTheme } from '@/lib/theme'

// Spanish UI (ADR-0009), adaptive light/dark + editorial fonts (ADR-0020).
// Fonts load at runtime — Expo Go compatible; switch to the expo-font config
// plugin when a development build arrives.

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const scheme = useColorScheme()
  const theme = useTheme()
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  })

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync()
  }, [loaded, error])

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
        <Stack.Screen name="index" />
        <Stack.Screen name="obra/[slug]" />
      </Stack>
    </SafeAreaProvider>
  )
}

import * as WebBrowser from 'expo-web-browser'
import { Pressable, StyleSheet, Text } from 'react-native'

import { useTheme } from '@/lib/theme'

// ADR-0017's footer link, mirrored from web /obra. The privacy page lives on
// the dashboard domain (ADR-0011) — EXPO_PUBLIC_SITE_URL points there. No
// env, no footer: we don't guess at a URL we don't control.

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL

export function PrivacyFooter() {
  const theme = useTheme()
  if (!SITE_URL) return null
  return (
    <Pressable
      style={styles.footer}
      onPress={() => void WebBrowser.openBrowserAsync(`${SITE_URL}/privacidad`)}
    >
      {({ pressed }) => (
        <Text style={[styles.link, { color: theme.faint }, pressed && styles.pressed]}>Privacidad</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  link: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.6,
  },
})

import * as WebBrowser from 'expo-web-browser'
import { Pressable, StyleSheet, Text } from 'react-native'

import { useTheme } from '@/lib/theme'

// "▶ Ver el episodio" — the app → episode amplifier loop (ADR-0011).

export function EpisodeButton({ youtubeId }: { youtubeId: string }) {
  const theme = useTheme()
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.episode },
        pressed && styles.pressed,
      ]}
      onPress={() => void WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${youtubeId}`)}
    >
      <Text style={styles.text}>▶ Ver el episodio</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: 40,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.6,
  },
})

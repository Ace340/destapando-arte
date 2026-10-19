import { Tabs } from 'expo-router'

import { TabBar } from '@/components/tab-bar'

// The four sections (GLOSSARY) as tabs: Descubre, Artistas, Cine,
// Favoritos. Screen registration here is declarative only — labels, icons,
// and active-route matching live in the custom bar (src/components/tab-bar).

export default function TabsLayout() {
  return (
    <Tabs tabBar={() => <TabBar />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="artistas" />
      <Tabs.Screen name="cine" />
      <Tabs.Screen name="favoritos" />
    </Tabs>
  )
}

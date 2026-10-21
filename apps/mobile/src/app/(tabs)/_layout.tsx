import { Tabs } from 'expo-router'

import { SECTIONS, TabBar } from '@/components/tab-bar'

// The four sections (GLOSSARY) as tabs: Descubre, Artistas, Cine,
// Favoritos. Registration is derived from SECTIONS in the custom bar
// (src/components/tab-bar) — one source of truth; labels, icons, and
// active-route matching live there too.

export default function TabsLayout() {
  return (
    <Tabs tabBar={() => <TabBar />} screenOptions={{ headerShown: false }}>
      {SECTIONS.map((section) => (
        <Tabs.Screen key={section.name} name={section.name} />
      ))}
    </Tabs>
  )
}

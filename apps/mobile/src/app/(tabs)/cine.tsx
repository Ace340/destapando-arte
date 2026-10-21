import { SectionEmpty, SectionScreen } from '@/components/section-screen'

// GLOSSARY Cine (section): the browse list of Films with at least one
// published Film connection. Blank page for now — the section fills in
// when the Cine feature lands.

export default function Cine() {
  return (
    <SectionScreen subtitle="Cine">
      <SectionEmpty title="Próximamente" hint="Los films que le deben algo al arte" />
    </SectionScreen>
  )
}

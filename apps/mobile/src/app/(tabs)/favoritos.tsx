import { SectionEmpty, SectionScreen } from '@/components/section-screen'

// GLOSSARY Favorito: the user's local shelf of saved Obras — on-device
// only, no account. Blank page for now — the section fills in when
// favoriting ships.

export default function Favoritos() {
  return (
    <SectionScreen subtitle="Favoritos">
      <SectionEmpty
        title="Aún no tienes favoritos"
        hint="Guarda obras desde su historia y aparecerán aquí"
      />
    </SectionScreen>
  )
}

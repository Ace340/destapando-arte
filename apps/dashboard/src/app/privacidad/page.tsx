import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacidad — Destapando el Arte',
  description: 'Qué guardamos y qué no. En una página, sin letra pequeña.',
}

// ADR-0017: privacy disclosed now, not patched later. Static on purpose —
// it renders before any setup and never depends on the database.
// Canonical text: docs/privacy/privacidad.md — keep both in sync.
export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Destapando el Arte
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Privacidad</h1>
        <p className="mt-1 text-zinc-600">Lo que existe de ti y lo que no. Sin letra pequeña.</p>
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Lo que existe de ti</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-zinc-800">
          <li>
            <strong>El token de notificaciones.</strong> Si pides que te avisemos, tu teléfono
            genera un token (Expo push). Es un identificador y así lo declaramos: sirve para
            mandarte el aviso que pediste, y nada más.
          </li>
          <li>
            <strong>Eventos anónimos de uso.</strong> Qué episodio se abre, qué obra se pide.
            Sin nombre, sin perfil, sin historial que te identifique.
          </li>
          <li>
            <strong>El origen de la instalación.</strong> De dónde vino la descarga (install
            referrer), para saber qué canal funciona.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Lo que no existe</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-zinc-800">
          <li>No hay cuentas.</li>
          <li>No pedimos tu correo.</li>
          <li>No guardamos datos personales: no los tenemos y no los queremos.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">La cámara</h2>
        <p className="mt-2 leading-7 text-zinc-800">
          Si usas el escáner, la imagen se envía a servidores de Google para su análisis. No la
          guardamos nosotros y no construimos ningún perfil con ella.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Si te vas</h2>
        <p className="mt-2 leading-7 text-zinc-800">
          Al desinstalar la app, el token deja de funcionar y no queda dato personal alguno que
          retirar — nunca lo hubo.
        </p>
      </section>
    </main>
  )
}

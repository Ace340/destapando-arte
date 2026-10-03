// Shown when Supabase env vars are missing — the 5-step connection wizard (ADR-0012: no Docker/CLI on this machine; hosted project).

const STEPS: readonly string[] = [
  'Crea un proyecto en supabase.com (región cercana, p. ej. Europa Oeste).',
  'En el SQL Editor, pega y ejecuta supabase/migrations/20260929120000_init_schema.sql.',
  'Ejecuta también supabase/seed.sql — deja el slice de 10 obras en estado "creada".',
  'En Project Settings → API, copia la Project URL y la secret key (sb_secret_…).',
  'Crea apps/dashboard/.env con SUPABASE_URL y SUPABASE_SECRET_KEY, y recarga esta página.',
]

export function SetupNotice() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Conecta Supabase</h1>
      <p className="mt-2 text-zinc-600">
        El tablero necesita su base de datos. Cinco pasos y estás dentro:
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-zinc-800">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-zinc-500">
        El schema físico rechaza violaciones del canon: sin 3 referencias no hay índice
        (ADR-0005), y las obras bloqueadas jamás toman referencias (ADR-0012).
      </p>
    </main>
  )
}

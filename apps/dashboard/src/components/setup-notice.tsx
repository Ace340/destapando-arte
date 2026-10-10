// Shown when Supabase env vars are missing — the 5-step connection wizard (ADR-0012: no Docker/CLI on this machine; hosted project).

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const STEPS: readonly string[] = [
  'Crea un proyecto en supabase.com (región cercana, p. ej. Europa Oeste).',
  'En el SQL Editor, pega y ejecuta supabase/migrations/20260929120000_init_schema.sql.',
  'Ejecuta también supabase/seed.sql — deja el slice de 10 obras en estado "creada".',
  'En Project Settings → API, copia la Project URL y la secret key (sb_secret_…).',
  'Crea apps/dashboard/.env con SUPABASE_URL y SUPABASE_SECRET_KEY, y recarga esta página.',
]

export function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Conecta Supabase</CardTitle>
          <CardDescription>
            El tablero necesita su base de datos. Cinco pasos y estás dentro:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-3 pl-5">
            {STEPS.map((step) => (
              <li key={step} className="text-sm leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">
            El schema físico rechaza violaciones del canon: sin 3 referencias no hay
            índice (ADR-0005), y las obras bloqueadas jamás toman referencias
            (ADR-0012).
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

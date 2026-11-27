import 'server-only'

import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'

// ADR-0026: the Allow-list — the email list that decides who may enter the
// Tablero. Every verified address gets full write access: no roles, no
// read-only tier. Hand-edited env, like every secret in this app
// (same stance as SUPABASE_* in supabase-server.ts).

// A session object is structurally typed here so the guard never depends on
// next-auth version internals.
type EditorSession = Pick<Session, 'user'> | null | undefined

export function editorEmails(): ReadonlySet<string> {
  return new Set(
    (process.env.AUTH_EDITOR_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isEditorEmail(email: string | null | undefined): boolean {
  return email != null && editorEmails().has(email.toLowerCase())
}

// Mirrors isConfigured() in supabase-server.ts: the login page renders an
// honest Spanish setup notice pre-configuration instead of a cryptic error.
export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET &&
      process.env.AUTH_EDITOR_EMAILS,
  )
}

// Page guard (defense in depth): the proxy already gates these routes, but a
// matcher change can silently lose coverage (Next 16 docs) — each gated page
// re-checks beside its isConfigured() guard. Redirects to /login with the
// ADR-0026 boundary preserved: the funnel pages are never touched by either layer.
export function requireEditor(session: EditorSession, callbackUrl: string): void {
  if (!isEditorEmail(session?.user?.email)) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }
}

// Action guard: the true ADR-0026 boundary — the only public-side write is
// createRequest, so every other action in actions.ts calls this first and
// answers with a Spanish throw like its sibling errors.
export function assertEditor(session: EditorSession): void {
  if (!isEditorEmail(session?.user?.email)) {
    throw new Error('Tablero: tu correo no está en la Allow-list (ADR-0026).')
  }
}

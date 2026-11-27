// ADR-0026: the proxy gate — Tablero routes only.

export { auth as proxy } from '@/auth'

// Positive matcher (Next 16 docs prefer it over negative lookaheads): only
// the Tablero surfaces are intercepted. The public pages (/obra/*,
// /artista/*, /privacidad), /login and /api/auth/* are never touched, so the
// Primary funnel (ADR-0011) and the Content-request boundary stay open
// untouched. A new editorial route must be added HERE and still carry its
// own requireEditor/assertEditor — Server Functions are POSTs to their
// route, and a matcher change can silently drop proxy coverage (Next 16
// docs' warning).
export const config = {
  matcher: ['/', '/cuadro/:path*', '/taller/:path*', '/ciudades/:path*'],
}

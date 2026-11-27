import { handlers } from '@/auth'

// The auth machinery — catch-all route handler required by Auth.js.
// Never add it to the proxy matcher: the OAuth callback is unauthenticated
// by definition (ADR-0026).
export const { GET, POST } = handlers

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { isEditorEmail } from '@/lib/access'

// ADR-0026: Auth.js Google OAuth verified against the Allow-list. JWT
// sessions — there is no auth table in Supabase and none is wanted; the
// signed cookie is the whole session state (no adapter).

// Two layers enforce the Allow-list (docs-mandated defense in depth):
//  1. `signIn` — an unlisted email never becomes a session at all.
//  2. `authorized` — the proxy gate re-checks the session email on every
//     intercepted route. The proxy's positive matcher (src/proxy.ts) keeps
//     public pages (/obra/*, /artista/*) and the auth machinery outside.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: '/login' },
  callbacks: {
    // Google-only, and only verified + listed addresses
    // (the official Google pattern: check email_verified with the list).
    signIn({ account, profile }) {
      if (account?.provider !== 'google') return false
      return Boolean(profile?.email_verified) && isEditorEmail(profile?.email)
    },
    // Session email must still be listed — belt to signIn's suspenders.
    authorized({ auth: session }) {
      return isEditorEmail(session?.user?.email)
    },
  },
})

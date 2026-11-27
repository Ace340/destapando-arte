import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { signIn } from '@/auth'
import { isAuthConfigured } from '@/lib/access'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// ADR-0026: the Allow-list's front door. Public route — the proxy matcher
// never intercepts it, or the unauthorized redirect would loop forever.
// Dynamic like every data page here: the callbackUrl (where the editor was
// headed) must be fresh, not frozen into a static shell.
export const dynamic = 'force-dynamic'

// Repeated params come back as string[] — one value is enough.
function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

// Same-origin relative path only — an absolute or protocol-relative URL falls
// back to home. Auth.js would reject the rest anyway (its redirect callback
// only allows the origin); this closes the class before signIn ever sees it.
function safeReturnUrl(value: string | undefined): string | undefined {
  return value?.startsWith('/') && !value?.startsWith('//') ? value : undefined
}

export default async function LoginPage(props: PageProps<'/login'>) {
  if (!isAuthConfigured()) {
    // Public page — so the empty state stays generic: no variable names, no
    // config shape. The person mounting the Tablero knows where they live.
    return (
      <main className="mx-auto flex min-h-[60dvh] max-w-xl items-center px-6 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Falta configurar el acceso</CardTitle>
            <CardDescription>
              El Tablero pide identidad antes de abrirse (ADR-0026) — y sus
              credenciales viven solo en el servidor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Defínelas en apps/dashboard/.env (o en Vercel) y recarga esta
              página. Las visitas no necesitan nada de esto — las páginas
              publicadas y el embudo siguen abiertos.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  const query = await props.searchParams
  const callbackUrl = safeReturnUrl(one(query.callbackUrl))
  const accessDenied = one(query.error) === 'AccessDenied'
  const authFailed = one(query.error) === 'AuthError'

  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-md items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Tablero</CardTitle>
          <CardDescription>
            Entra con la cuenta de la Allow-list para editar el Catálogo
            (ADR-0026).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accessDenied ? (
            <p className="text-sm text-destructive">
              Ese correo no está en la Allow-list — revisa la lista en el
              servidor y vuelve a entrar.
            </p>
          ) : null}
          {authFailed ? (
            <p className="text-sm text-destructive">
              La entrada falló por un problema de configuración o del
              proveedor — no es tu correo.
            </p>
          ) : null}
          <form
            action={async () => {
              'use server'
              try {
                await signIn('google', { redirectTo: callbackUrl ?? '/' })
              } catch (caught) {
                // AccessDenied (el correo no está en la lista) vuelve con su
                // aviso; cualquier otro fallo de Auth.js recibe el suyo — no
                // los confundamos (code review, 2026-11-27). Los errores de
                // redirect() se relanzan a propósito: Next los maneja.
                if (caught instanceof AuthError) {
                  redirect(
                    caught.type === 'AccessDenied'
                      ? '/login?error=AccessDenied'
                      : '/login?error=AuthError',
                  )
                }
                throw caught
              }
            }}
          >
            <Button type="submit" className="w-full">
              Entrar con Google
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Las visitas sin sesión siguen viendo las páginas publicadas — el
            candado solo cubre el Tablero.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

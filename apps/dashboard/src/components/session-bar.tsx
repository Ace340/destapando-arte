import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

// ADR-0026: the sign-off half of the gate. The same proxy that bounces
// strangers to /login leaves editors with no way back out — this fills it.
// It reads the session cookie, so for every anonymous visit (public pages
// included) it renders nothing and the funnel stays pixel-identical. The
// cost of that convenience: /privacidad joins the dynamic routes (auth()
// touches the cookie jar) — acceptable for one static paragraph.
export async function SessionBar() {
  const session = await auth();
  if (!session) return null;

  return (
    <div className="fixed right-4 top-4 z-50">
      <form
        action={async () => {
          "use server";
          // Back to the gate, not to a gated page — otherwise the proxy
          // would bounce the fresh anonymous session straight here again.
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button type="submit" variant="ghost" size="sm">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}

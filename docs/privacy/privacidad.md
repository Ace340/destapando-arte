# Privacidad — Destapando el Arte

> **Fuente canónica de este texto.** La página pública `/privacidad`
> (`apps/dashboard/src/app/privacidad/page.tsx`) renderiza este contenido —
> mantener ambos sincronizados.
>
> **Estado**: borrador (ADR-0017 — "Draft: Patrick; review before closed beta").
> **Porqué**: la privacidad se declara ahora, no se parchea después; la frase de
> la cámara navega desde el día uno para no bloquear la revisión de Play más tarde.

---

## Lo que existe de ti

- **El token de notificaciones.** Si pides que te avisemos, tu teléfono genera un
  token (Expo push). Es un identificador y así lo declaramos: sirve para mandarte
  el aviso que pediste, y nada más.
- **Eventos anónimos de uso.** Qué episodio se abre, qué obra se pide. Sin nombre,
  sin perfil, sin historial que te identifique.
- **El origen de la instalación.** De dónde vino la descarga (install referrer),
  para saber qué canal funciona.

## Lo que no existe

- No hay cuentas.
- No pedimos tu correo.
- No guardamos datos personales: no los tenemos y no los queremos.

## La cámara

Si usas el escáner, la imagen se envía a servidores de Google para su análisis.
No la guardamos nosotros y no construimos ningún perfil con ella.

## Si te vas

Al desinstalar la app, el token deja de funcionar y no queda dato personal alguno
que retirar — nunca lo hubo.

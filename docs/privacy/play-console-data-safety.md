# Play Console — Data Safety (borrador)

> **Estado**: borrador para revisión antes de la beta cerrada (ADR-0017).
> Inventario honesto: tokens push Expo, eventos anónimos de analytics, install
> referrer. Nada de cuentas, correo ni datos personales.

## Recogida de datos (Data collected)

| Tipo (sección Play) | ¿Recogemos? | Detalle a declarar |
|---|---|---|
| Device or other IDs | ✅ Sí | Expo push token — identificador del dispositivo; usado para notificaciones («Avísame»); **no** vinculado a identidad. Borrado: al desinstalar, el token muere. |
| App activity (interacciones) | ✅ Sí | Eventos anónimos (`episode_tap`, pedidos de obra, términos de búsqueda vacíos). Sin perfil de usuario. |
| Install referrer | ✅ Sí | Atribución de instalación por canal (ADR-0016). |
| Fotos y vídeos | ⚠️ Declarar con cuidado | La imagen del escáner **se envía a servidores de Google** para análisis y no la almacenamos. Declararla como procesada efemeramente, no recolectada ni compartida con terceros para publicidad. Frase de la política (verbatim ADR-0017): «si usas el escáner, la imagen se envía a servidores de Google para su análisis». |

## Lo que NO se declara (porque no existe)

- Nombre, correo, teléfono, dirección.
- Cuentas de usuario.
- Ubicación.
- Contactos, archivos, historial de navegación.

## Cifrado y borrado

- **Cifrado en tránsito**: sí (todo por HTTPS).
- **Los usuarios pueden solicitar el borrado de sus datos**: no aplica — no hay
  datos personales que borrar; el token deja de funcionar al desinstalar.

---

**Pendiente (Patrick, antes de beta cerrada)**: revisar la fila «Fotos y vídeos»
contra el formulario real de Play Console y confirmar la redacción exacta del
procesamiento efímero del escáner.

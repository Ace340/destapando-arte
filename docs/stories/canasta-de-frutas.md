# Story placeholder — Canasta de frutas

Estado: **placeholder — pendiente de investigación y pluma editorial (Patrick)**
Slug: `canasta-de-frutas` · Artista: Caravaggio · Año: c. 1596
Q-ID: **Q2270291** — pasó a MATCH tras el fix del regex de «circa» (Increment 6).

⚠️ **Nota editorial abierta**: esta pieza es uno de los dos picks de Caravaggio que esperan
confirmación de Patrick (placeholders de seed, CANON). Confirmar antes de invertir horas.

Estructura objetivo — plantilla probada: `docs/stories/noche-estrellada.md` (Increment 7).

- [ ] **Beats**: Resumen — qué es · Por qué importa — el argumento (obligatorio, 2–3 frases)
- [ ] **Curiosidades** ×5 (ADR-0007: tipadas — myth/fact/legend — cada una con fuente verificada en vivo el día del borrador; chips con URL)
- [ ] **Conexiones de cine** (ADR-0014: análisis de plano propio, texto nuestro; `evidence_visual = none` salvo diagrama propio)
- [ ] **Paleta** — 5 hexes
- [ ] **Enriquecimiento**: imagen display (Commons, derechos verificados), instancia física (por verificar — Ambrosiana, Milán), `indexed = false` (ADR-0012)
- [ ] **Carga SQL idempotente** → `story_status = 'draft'` → publish como paso aparte con OK de Patrick

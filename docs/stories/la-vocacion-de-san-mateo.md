# Story placeholder — La vocación de san Mateo

Estado: **placeholder — pendiente de investigación y pluma editorial (Patrick)**
Slug: `la-vocacion-de-san-mateo` · Artista: Caravaggio · Año: 1599–1600
Q-ID: **Q969377** — *pinneado* con `pinnedYearOverride` (Increment 6): el ítem ES la pintura
(etiqueta única, P170 ✓), pero el P571=1609 de Wikidata es un error de fuente única que contradice
el datación universal Contarelli 1599–1600. El override salta solo la puerta P571; documentado
en la línea de evidencia del write.

⚠️ **Nota editorial abierta**: esta pieza es uno de los dos picks de Caravaggio que esperan
confirmación de Patrick (placeholders de seed, CANON). Confirmar antes de invertir horas.

Estructura objetivo — plantilla probada: `docs/stories/noche-estrellada.md` (Increment 7).

- [ ] **Beats**: Resumen — qué es · Por qué importa — el argumento (obligatorio, 2–3 frases)
- [ ] **Curiosidades** ×5 (ADR-0007: tipadas — myth/fact/legend — cada una con fuente verificada en vivo el día del borrador; chips con URL)
- [ ] **Conexiones de cine** (ADR-0014: análisis de plano propio, texto nuestro; `evidence_visual = none` salvo diagrama propio)
- [ ] **Paleta** — 5 hexes
- [ ] **Enriquecimiento**: imagen display (Commons, derechos verificados), instancia física (por verificar — Contarelli, San Luigi dei Francesi, Roma), `indexed = false` (ADR-0012)
- [ ] **Carga SQL idempotente** → `story_status = 'draft'` → publish como paso aparte con OK de Patrick

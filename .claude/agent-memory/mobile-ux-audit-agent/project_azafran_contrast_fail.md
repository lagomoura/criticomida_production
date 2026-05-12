---
name: Azafrán + text-inverse falla WCAG AA — contraste 2.89:1
description: El token azafrán (#D4870A) como fondo con text-inverse (blanco) tiene ratio 2.89:1, debajo del umbral 4.5:1 para texto pequeño
type: project
---

Azafrán (#D4870A) sobre blanco (#FFFFFF): **2.89:1** — falla WCAG AA para texto < 14pt bold.
Azafrán (#D4870A) sobre carbón (#1A1714): **6.18:1** — pasa WCAG AA.

Ubicaciones afectadas:
- TechnicalPillars.tsx:29 — tono "neutral" usa bg-color-azafran text-text-inverse
- SegmentedSelect.tsx:30 — tono "positive" usa bg-color-azafran text-text-inverse (preexistente)
- SegmentedSelect.tsx:31 — tono "neutral" usa bg-color-azafran text-text-inverse (desde sprint A+B)

Los labels son text-[11px] font-semibold (pequeño → exige 4.5:1).

FIX: usar text-text-primary en lugar de text-text-inverse cuando el fondo es azafrán.
No aplica a páprika (paprika + blanco = 5.39:1 ✓) ni albahaca (albahaca + blanco = 6.63:1 ✓).

**Why:** Flaggeado como ALTO en audit post-sprint A+B. No bloquea render pero viola accesibilidad en hot path.
**How to apply:** Siempre calcular contraste al auditar botones con background de marca. Azafrán no puede combinarse con texto blanco en texto pequeño.

---
name: project_compose_audit_findings
description: Hallazgos clave de la auditoría del flujo compose (commit 210e297). Decisiones confirmadas y anti-patrones documentados para evitar re-flag.
metadata:
  type: project
---

Auditoría del flujo compose realizada en commit 210e297.

**Decisiones de diseño confirmadas (no re-flaguear):**
- El flujo compose usa `mode="essentials"` primero (foto+rating+nota) y `mode="details"` bajo colapso progressivo — esta es la arquitectura intencional.
- Toast de éxito + navigate a `/reviews/{id}` es el único estado de éxito. No hay pantalla celebratoria dedicada — fue identificado como gap.
- La nota se llama "Notas" en los mensajes (i18n key `notesLabel`) — el copy es seco, identificado como hallazgo.
- StarRating usa `size="lg" showValue` en compose: estrellas text-3xl con número Cormorant text-2xl — esto está bien respecto a brand. El número en font-display es correcto.
- El `colorScheme: 'light dark'` está declarado en `app/layout.tsx` — no es un hallazgo.

**Hallazgos confirmados como reales:**
- `dark:` count en todos los componentes del flujo compose: ReviewFormBody=1 (solo ghostwriter banner), ComposeClient=0, TechnicalPillars=0, SegmentedSelect=0, ChipInput=0, StarRating=0, MentionTextarea=0, Button=0, Toast=0. El sistema funciona porque todos consumen tokens semánticos (--surface-card, --text-primary, etc.) que se resuelven automáticamente vía el bloque .dark en globals.css. NO es un fallo de paridad — es la arquitectura correcta de tokens semánticos.
- TechnicalPillars neutral tone: `text-text-primary` (#2A211C Espresso) sobre `bg-color-terracota` (#C96A4B) → ~3.6:1, solo AA large, falla WCAG AA para body text pequeño (font-size 11px).
- globals.css contiene `rgba(212, 135, 10, ...)` en múltiples reglas — color legacy del Azafrán v2, no v2.1 Terracota. Afecta focus ring de .form-control, .form-select, .review-sort-dropdown pero NO afecta el compose moderno (que usa Tailwind utilities directamente). Es un hallazgo de globals.css legacy.
- El estado de éxito es solo toast + navegación — no hay momento celebratorio.
- El label de nota ("Notas") es seco; el placeholder sí tiene voz ("Contá qué te voló la cabeza...").
- La identidad del compose ("Escribí una reseña") vs convención social (Instagram usa "New post", Letterboxd usa "Add to your diary") — el titular "Nueva reseña" es genérico.

**Why:** Para que auditorías futuras no dupliquen análisis ya resuelto o flaggeen la arquitectura de tokens como error.
**How to apply:** En próximas auditorías del flujo compose, verificar si estos hallazgos fueron aplicados revisando los archivos; no asumir que siguen igual.

---
name: compose-audit-210e297
description: Audit del flujo compose/review en commit 210e297 — hallazgos por criticidad para referencia futura
metadata:
  type: project
---

Audit completo del flujo compose realizado en commit 210e297 (feat restaurants).

**Why:** El usuario pidió audit enfocado en compose con 7 ejes específicos, incluyendo la crítica "se siente como una planilla".

**Hallazgos confirmados (no re-auditar como nuevos):**

MEDIOS confirmados en compose:
- Autocomplete inputs (RestaurantAutocomplete.tsx:304, DishAutocomplete.tsx:244) tienen `h-10` (40px) — 4px bajo HIG. Los clear buttons internos sí tienen h-11 (ok). El input touch target es el gap.
- Dropdown rows de autocomplete (`px-3 py-2`) tienen ~32-36px de alto — bajo 44px. Frecuencia alta en el flujo crítico.
- ChipInput preset pills (`px-3 py-1`) tienen ~28-32px de alto. Secundario pero en hot path avanzado.
- DishReviewForm (in-restaurant modal, PublishReviewModal) usa `mode='all'` sin progressive disclosure → muestra todos los campos juntos → contribuye a la sensación de planilla.
- StarRating: p-1 padding en lg → ~40px por estrella. 4px bajo HIG en el eje crítico (rating).

BAJO:
- MentionTextarea suggestion rows `px-3 py-2` → ~36px. Bajo 44px pero baja frecuencia.

POSITIVOS (no re-flag):
- Sticky submit bar OK: safe-area doble confirmada (container + sticky bar internamente).
- viewport-fit=cover confirmado en locale/layout.tsx.
- Autosave con 600ms debounce en localStorage — sólido.
- BottomNav compose button h-12 w-12 (48px) — OK.
- StarRating type="button" con p-1 en lg → efectivo ~40px/estrella — borderline pero aceptable dado que hay 5 estrellas en fila (área total grande).
- WouldOrderAgain buttons px-4 py-2.5 → ~40px alto pero con texto "Sí"/"No" anchos → aceptable.
- GhostwriterAssist close button h-11 w-11 — OK.
- `text-base` en todos los inputs de mobile → no hay zoom involuntario en iOS.
- backdrop-blur en sticky bar: solo al open/close; sin jank en scroll (ya deliberadamente removido del BottomNav).

**How to apply:** Cuando se pida re-audit del flujo compose, marcar estos como resueltos o pendientes según el estado actual del código.

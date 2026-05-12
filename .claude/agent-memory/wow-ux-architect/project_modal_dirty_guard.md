---
name: Modal dirty close guard — Sub-sprint 2
description: Patrón useDirtyCloseGuard implementado en PublishReviewModal y EditPostModal (2026-05-08)
type: project
---

Implementado `useDirtyCloseGuard` en `app/hooks/useDirtyCloseGuard.ts` y aplicado a ambos modales de reseña.

**Por qué:** Evitar pérdida de datos cuando el usuario cierra accidentalmente un modal con contenido escrito.

**Cómo aplicar:**
- Hook en `app/hooks/useDirtyCloseGuard.ts` — exporta `{ confirmingDiscard, requestClose, confirmDiscard, cancelDiscard }`.
- `requestClose` reemplaza a `onClose` en los 3 vectores de cierre: X button, overlay tap, Escape key.
- Cuando `confirmingDiscard` es true, se muestra un banner inline (no modal anidado) con botones `danger` + `ghost`.
- Para `PublishReviewModal` (custom dialog): el banner es Row 3 del grid, sticky en el bottom del dialog.
- Para `EditPostModal` (usa Modal primitive): el banner se pasa como `footer` prop al Modal.
- `DishReviewForm` expone `onBodyChange?: (body: ReviewFormBodyValue) => void` y `buildInitialValue` como named export para que los padres puedan hacer dirty check sin refactor mayor de ReviewFormBody.

**Thresholds de dirty:**
- PublishReviewModal: `note.trim().length >= 3 || photos.length > 0 || pros.length > 0 || cons.length > 0`
- EditPostModal: compara `rating`, `note.trim()`, `photos.length`, `existingImages.length`, `pros.length`, `cons.length` vs snapshot inicial.

**Keys i18n:** `discardConfirmTitle`, `discardConfirmAction`, `discardCancel` bajo `restaurant.publishReviewModal` y `social.editPost` en es/en/pt.json.

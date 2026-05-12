---
name: Toast action button sin padding — target ~18px
description: El botón action de Toast.tsx no tiene padding ni min-height; target efectivo ~18px (text-xs inline). Primer uso en compose publish flow.
type: project
---

Toast.tsx (app/components/ui/Toast.tsx:199) tiene el action button como texto inline text-xs sin padding.
Touch target efectivo: ~64px × 18px — incumple HIG 44px en altura.

Primer caller con action: ComposeClient.tsx (sprint A+B) — "Ver reseña" post-publish.
Dismiss button: h-7 w-7 = 28px — también undersized, preexistente.

FIX pendiente en Toast.tsx: agregar min-h-[36px] inline-flex items-center py-1.5 px-2 al action button.

**Why:** El action button nunca fue usado antes del sprint A+B. Ahora es el único CTA de confirmación post-publish.
**How to apply:** Al auditar flujos que usan toast con action, revisar Toast.tsx el action button target. No es un false positive — tiene que fixearse en Toast.tsx aunque el caller esté correcto.

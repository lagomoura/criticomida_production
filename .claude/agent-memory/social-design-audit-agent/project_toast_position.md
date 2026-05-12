---
name: Toast — posicionamiento responsive
description: Toast está bottom-center en mobile y bottom-right en sm+ por decisión explícita de UX
type: project
---

`ToastViewport` en `app/components/ui/Toast.tsx` línea 164:
`inset-x-0 bottom-4` (mobile, bottom-center) → `sm:bottom-6 sm:left-auto sm:right-6 sm:items-end` (desktop, bottom-right)

El bottom-center en mobile es convención en redes sociales (Instagram, TikTok). En desktop mueve a bottom-right.
La convención SaaS pura (Linear/Stripe) prefiere top-right, pero este producto tiene audiencia mixta y la decisión responsive es razonable.

**How to apply:** No re-flagear como error el toast bottom-center en mobile. Solo flagear si en desktop permanece bottom-center (lo cual ya está corregido con el sm: breakpoint).

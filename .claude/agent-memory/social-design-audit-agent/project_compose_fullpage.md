---
name: Compose — full-page, no modal
description: /compose es una ruta propia full-page; cumple convención social (no es modal centrado)
type: project
---

`app/[locale]/compose/page.tsx` es una ruta dedicada con `<main>` propio.
El flujo de composición de reseña es full-page, conforme con convención Instagram/X/Letterboxd.
El BottomNav tiene el botón compose central que navega a `/compose` — no abre modal centrado.

**How to apply:** No flagear el flujo compose como F22 (modal centrado). Es correcto. Solo revisar si el layout interno de ComposeClient respeta las convenciones (header sticky con Cancel + Publish).

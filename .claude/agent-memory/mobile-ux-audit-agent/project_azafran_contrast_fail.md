---
name: contrast-fail-brand-colors-on-white
description: Terracota y Dorado como fondo con text-inverse (blanco) fallan WCAG AA para texto pequeño
metadata:
  type: project
---

Stale memory actualizada post-Ola 1+2+3 (commit cb0b8b2). La paleta cambió de Azafrán/Páprika a Especiería (Terracota/Dorado). El fallo persiste pero con diferentes tokens.

**Terracota (#C96A4B) sobre blanco**: ~3.70:1 — falla WCAG AA para texto < 14pt bold (necesita 4.5:1).
**Dorado (#D6A75C) sobre blanco**: ~2.20:1 — falla WCAG AA para TODO texto (incluso large text necesita 3:1).

Ubicaciones afectadas actualmente:
- `TechnicalPillars.tsx:28` — tono "neutral": `bg-color-terracota text-text-inverse` → 3.70:1 para texto 11px semibold. FALLA AA.
- `TechnicalPillars.tsx:29` — tono "positive": `bg-color-dorado text-text-inverse` → 2.20:1. FALLA AA y Large.
- `SegmentedSelect.tsx:33` — tono "positive": `bg-color-dorado text-text-inverse` → 2.20:1. FALLA.
- `SegmentedSelect.tsx:34` — tono "neutral": `bg-action-primary (=terracota) text-text-inverse` → 3.70:1. FALLA AA small text.
- `ReviewFormBody.tsx:519` — WouldOrderAgain "Sí" seleccionado: `bg-color-dorado text-text-inverse` → 2.20:1. FALLA.

FIX: para fondos Dorado → usar `text-espresso` o `text-text-primary` (carbón). Para fondos Terracota en texto < 14pt → ídem.

**Why:** Flaggeado como ALTO en audit post-Ola 1+2+3. Los usuarios revisan la app al sol en restaurantes — contraste reducido ya es un problema, más aún al sol.
**How to apply:** Siempre calcular contraste al auditar botones con background de marca. Ni Dorado ni Terracota pueden combinarse con texto blanco en texto pequeño. Solo color-terracota-deep (#8B3D27) o superior pasan AA con blanco en small text.

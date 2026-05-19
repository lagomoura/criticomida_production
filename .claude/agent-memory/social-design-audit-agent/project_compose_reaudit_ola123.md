---
name: project_compose_reaudit_ola123
description: Estado post-Ola 1+2+3 del flujo compose (commit cb0b8b2). Hallazgos cerrados, abiertos, y nuevos emergentes.
metadata:
  type: project
---

Re-auditoría del flujo compose tras 3 olas de mejoras (commit cb0b8b2).

## Hallazgos originales — estado final

**CERRADOS:**
- CRÍTICO #1 (planilla) — parcialmente cerrado (85%). Requiere Ola 4 para contraste.
- ALTO #1 (estado éxito) — CERRADO: overlay celebratorio en ComposeClient.tsx:469-499.
- ALTO #2 (bloques sin jerarquía) — CERRADO: kicker "¿Dónde y qué comiste?" en ComposeClient.tsx:568-594.
- ALTO #4 (modo avanzado sin framing) — CERRADO: "Modo crítico" con Cormorant en ComposeClient.tsx:625-641 y DishReviewForm.tsx:355-366.
- ALTO #5 (Button sin active:) — CERRADO: Button.tsx:17 tiene active:scale-[0.98] active:brightness-95.
- MEDIO #1 (h1 genérico) — CERRADO: h1 con titlePrefix + dish.name italic en ComposeClient.tsx:510-518.
- MEDIO #2 (rating plano) — CERRADO: wash dorado + border-l-color-dorado en ReviewFormBody.tsx:493.
- MEDIO #3 (submitBlockReason) — CERRADO: checklist vivo en ComposeClient.tsx:392-407.
- MEDIO #4 (ghostwriter tono) — CERRADO: copy + font-display en ReviewFormBody.tsx:441.
- MEDIO #5 (ghostwriter título) — CERRADO: font-display text-lg en ReviewFormBody.tsx:441.
- BAJO #1 (h1 tipografía) — CERRADO.
- BAJO #3 (italic decorativo) — CERRADO.

**ABIERTOS (no tocados):**
- ALTO #3 — rgba(212,135,10) legacy en globals.css (10 ocurrencias). No afecta compose moderno.
- BAJO #2 — box-shadow legacy en globals.css.

**REABIERTO:**
- CRÍTICO #2 (TechnicalPillars neutral) — Ola 1 cambió a text-text-inverse pero el contraste empeoró: blanco sobre terracota light = 3.72:1 (vs 3.6:1 anterior); blanco sobre terracota dark (#E07A5F) = 2.95:1. Peor en dark.

## Nuevos hallazgos emergentes de las olas (Ola 4 pendiente)

**NUEVO CRÍTICO #N1:** text-color-dorado (#D6A75C) sobre surface-page (#F7F1E8) = 1.96:1.
  Afecta: kicker del overlay celebratorio (ComposeClient.tsx:485) y checklist done items (ComposeClient.tsx:732).
  Dark mode OK: #C99A52 sobre #1C140F = 7.12:1.
  Fix: usar text-text-primary o text-color-espresso-mid para el texto; reservar color dorado para íconos.

**NUEVO ALTO #N2:** text-[10px] font-semibold uppercase text-color-terracota = 3.31:1 en light.
  Afecta: kickers de sección en ComposeClient.tsx:575 y ReviewFormBody.tsx:169 (SectionDivider).
  Dark mode OK: 6.16:1.

**NUEVO ALTO (reabierto) #N3:** TechnicalPillars neutral regresión. Ver arriba.

**NUEVO MEDIO #N4:** Checklist icon sizing inconsistente: h-2 w-2 (pending) vs h-3 w-3 (done).
  Afecta: ComposeClient.tsx:737-739. Fix: unificar en h-3 w-3.

## Decisiones de diseño confirmadas en esta auditoría

- El overlay celebratorio usa role="status" aria-live="polite" — es contenido accesible, no decorativo.
- La arquitectura de motion del overlay es correcta: fade siempre on, spring+slide solo con prefers-no-preference, todo colapsado a 0.01ms con prefers-reduce wildcard.
- El edit mode en DishReviewForm usa mode='all' SIN el banner advancedModeTitle — correcto porque la edición es intencional.
- text-color-dorado como token de identidad dorado no tiene contraste suficiente sobre surface-page en light mode para texto. Esto es un límite de la paleta, no un error de implementación.
- La paridad dark de los tokens semánticos es correcta (bloque .dark en globals.css). El dorado dark recalibrado (#C99A52) sí pasa AA.

**Why:** Para que la re-auditoría post-Ola 4 no repita hallazgos ya cerrados ni analice decisiones confirmadas.
**How to apply:** En Ola 4, el scope es: N1 (kicker overlay + checklist), N2 (kicker 10px), N3 (TechnicalPillars neutral paleta), N4 (icon size). Los legacy globals.css siguen abiertos como deuda técnica separada.

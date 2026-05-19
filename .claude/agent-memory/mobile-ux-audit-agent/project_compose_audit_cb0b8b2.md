---
name: compose-reaudit-cb0b8b2
description: Re-auditoría de validación post Ola 1+2+3 en commit cb0b8b2 — estado por hallazgo y regresiones nuevas
metadata:
  type: project
---

Re-auditoría solicitada por el usuario tras aplicar 3 olas de mejoras al flujo compose.
Commit: cb0b8b2 (fix notifications — último al momento del audit).

**CERRADOS definitivamente (Ola 1+2):**
- Autocomplete clear buttons (RestaurantAutocomplete/DishAutocomplete): ahora h-11 w-11. CERRADO.
- Autocomplete input height: ahora h-11 en ambos. CERRADO.
- Dropdown rows: ahora min-h-[44px] py-2.5. CERRADO (Restaurant) y CERRADO (Dish).
- Category native select: eliminado completamente de ComposeClient — no hay más <Select>. CERRADO.
- ChipInput add button: ahora h-11 w-11. CERRADO (era h-10).
- ChipInput preset pills: ahora min-h-[36px] py-2 — sigue bajo 44px pero subió de ~28px; riesgo menor.
- DishReviewForm modo create: ahora mode="essentials" + toggle. CERRADO (sensación planilla).
- Ghostwriter upload/reanalyze buttons: ahora min-h-[44px]. CERRADO.
- Toast action button: ahora min-h-[44px]. CERRADO.
- Toast dismiss button: ahora h-11 w-11 (44px). CERRADO.
- Draft autosave: confirmado en sprint A+B, sigue operativo.

**ABIERTOS que persisten:**
- Contraste Dorado+blanco (~2.20:1) y Terracota+blanco (~3.70:1) para texto 11px: ABIERTO. Ver project_azafran_contrast_fail.md (actualizado).
- Button size="md" = h-10 (40px): persiste en Cancel y Publish de ComposeClient sticky bar (4px bajo HIG).
- ChipInput preset pills min-h-[36px]: sigue 8px bajo 44px. Medio persistente.
- Anonymous checkbox h-4 w-4: persiste. Bajo (label wrapper ayuda).

**NUEVAS REGRESIONES Ola 1+2+3:**
- GhostwriterAssist "Apply blurb" button: py-1 → ~24px. Nuevo Alto. Línea ~276.
- GhostwriterAssist suggestion chips: px-2.5 py-1 → ~24px. Nuevo Medio. Línea ~434.
- Overlay celebration backdrop-blur-sm: en GPU bajo Android puede tartamudear. Hipótesis.
- collapseDetails i18n inconsistencia: "Ocultar detalles" (compose) vs "Ocultar opciones avanzadas" (dishReviewForm). Bajo cosmético.

**Why:** El usuario quiere saber qué quedó pendiente y qué se rompió con las 3 olas.
**How to apply:** En próximas auditorías del flujo compose, estos son los únicos hallazgos pendientes.

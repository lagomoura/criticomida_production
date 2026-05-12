---
name: Sprint A+B compose aplicados
description: Cambios implementados en /compose y componentes relacionados en la sesión 2026-05-08
type: project
---

Implementados Sprint A (críticos identidad + tap targets) y Sprint B (DMMT + WOW editoriales) sobre `/[locale]/compose` y componentes del ecosistema de reseñas.

**Why:** Audit previo identificó token drift (colores hardcoded en TechnicalPillars/SegmentedSelect), inputs con text-sm causando iOS zoom, tap targets de foto <44px, copy genérico en notas y CTA de submit sin feedback cuando disabled.

**How to apply:** Estos hallazgos están cerrados. No re-flageear en audits futuros sobre estos componentes.

## Sprint A — Cerrado

### Token drift corregido
- `TechnicalPillars.tsx` — TONE_STYLES: `rose-500/amber-400/emerald-500/text-white` → `color-paprika/color-azafran/color-albahaca/text-text-inverse`
- `SegmentedSelect.tsx` — TONE_STYLES neutral y negative: `amber-400/rose-500/text-white` → `color-azafran/color-paprika/text-text-inverse`
- `StarRating.tsx` — `text-amber-400` → `text-action-highlight`, `text-neutral-300` → `text-border-default`

### Font-size iOS zoom prevenido
- `ReviewFormBody.tsx` — `inputBase`: `text-sm` → `text-base sm:text-sm`
- `ReviewFormBody.tsx` — `companyOther` input: `text-sm` → `text-base sm:text-sm`
- `RestaurantAutocomplete.tsx` — input: `text-sm` → `text-base sm:text-sm`
- `DishAutocomplete.tsx` — input: `text-sm` → `text-base sm:text-sm`

### Radius consistencia
- `RestaurantAutocomplete.tsx` — `rounded-md` → `rounded-xl`
- `DishAutocomplete.tsx` — `rounded-md` → `rounded-xl`
- `MentionTextarea.tsx` — `rounded-md` → `rounded-xl`

### Tap targets
- Botones eliminar foto: `h-9 w-9` → `h-11 w-11` (44px, en ambos existing e new photos)
- Botón "Empezar de cero": `h-9` → `h-10` (válido: destructivo secundario en toolbar densa)

### Suspense fallback
- `compose/page.tsx` — `fallback={null}` → `fallback={<LoadingView />}`
- `LoadingView` exportada desde ComposeClient para uso en page.tsx

## Sprint B — Cerrado

### Copy editorial notas (notesPlaceholder en dishReviewForm)
- es: "Contá qué te voló la cabeza — o lo que decepcionó. Textura, punto, temperatura, porción."
- en: "Tell us what blew you away — or what fell short. Texture, doneness, temperature, portion."
- pt: "Conta o que te impressionou — ou o que decepcionou. Textura, ponto, temperatura, porção."

### Header dinámico compose
- Cuando hay plato seleccionado: `t('titleWithDish', { dish })` con `line-clamp-2`
- Strings añadidas en los 3 idiomas: `compose.titleWithDish`

### StarRating con valor numérico Cormorant
- Nueva prop `showValue?: boolean` (default false)
- Cuando `showValue=true && !readonly && value > 0`: muestra `value.toFixed(1)` en `font-display text-2xl`
- Activado en ReviewFormBody en el StarRating de rating principal

### Toast de publish con action
- `toast.success()` → `toast.toast({ ..., action: { label: t('viewReview'), onClick: router.push } })`
- String `compose.viewReview` añadida en es/en/pt
- Duration 6000ms para dar tiempo de leer y clickear la action

### minCharsHint con remaining
- Variable: `t('minCharsHint', { remaining: MIN_TEXT - noteLength })`
- Strings actualizadas en compose namespace: `{remaining}` en lugar de `{n}`

### Disabled submit feedback inline
- `submitBlockReason`: primer requisito faltante entre restaurant/dish/note
- Texto `text-right text-xs text-text-muted` debajo del sticky bar
- Strings: `compose.disabledNeedsRestaurant`, `compose.disabledNeedsDish`, `compose.disabledNeedsNote`

## Pendiente (diferido)
- C5: progreso de upload por foto (requiere frontend-react-architect)
- B6: agrupación visual del form de 12 secciones (decisión de diseño, pase aparte)

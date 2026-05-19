---
name: project_ola3_wow_applied
description: Ola 3 WOW compose — overlay de éxito, jerarquía editorial, modo avanzado, h1 con voz. Implementado 2026-05-16.
metadata:
  type: project
---

Implementado 2026-05-16. Todos los cambios en `app/[locale]/compose/ComposeClient.tsx`, `app/components/social/ReviewFormBody.tsx`, `app/[locale]/restaurants/[id]/components/DishReviewForm.tsx`, `app/globals.css` y `messages/{es,en,pt}.json`.

**Por qué:** Crítica de usuario real "todo el proceso me parecía una planilla, todo muy mecánico" — la Ola 3 mata esa sensación con jerarquía editorial y momento de deleite post-publicación.

**How to apply:** No duplicar estos cambios en sesiones futuras. Si se propone otra iteración del flujo compose, partir de este estado como baseline.

## Cambios aplicados

### 1. Estado de éxito celebratorio (ComposeClient.tsx)
- `celebrationData` state con `{ dishName, restaurantName, postId }`.
- Overlay `fixed inset-0 z-50` con `cc-celebrate-overlay-anim` (fade 280ms).
- Check icon (faCheckCircle) en círculo Dorado con `cc-celebrate-check-anim` (650ms, ease-spoon, prefers-reduced-motion guard).
- Nombre del plato en `font-display italic` (Cormorant italic — brand-identity-v2 §3.4).
- Microcopy con voz Palato en 3 idiomas.
- Delay 1700ms antes de `router.push`. Sin botones (DMMT puro — feedback, no decisión).
- `aria-live="polite"` (no assertive — Medio del audit mobile corregido).
- Failsafe 12s pre-existente preservado.

### 2. Jerarquía editorial del label "Tu reseña" (ReviewFormBody.tsx)
- En `mode='essentials'`: label pasa a `font-display text-lg font-medium` (Cormorant, pregunta editorial).
- En `mode='all'`: conserva el uppercase técnico `text-[11px] font-semibold uppercase` (nerd mode, planilla intencional).
- Solo el campo primario de la opinión recibe Cormorant — no uniformidad nueva sino jerarquía intencional.

### 3. Encuadre "modo avanzado" (ComposeClient.tsx + DishReviewForm.tsx)
- Banner `rounded-2xl border border-border-subtle bg-surface-card` dentro del colapso de detalles.
- `✦` decorativo (aria-hidden) + título en `font-display text-base font-medium` + desc en sans pequeño.
- Voz: "Modo crítico / Para cuando querés ir más a fondo — todo es opcional."
- Encuadra el contenido avanzado sin bloquearlo ni esconderlo mal para los nerds.

### 4. h1 con voz de marca (ComposeClient.tsx)
- Sin plato: "¿Qué comiste?" (es) / "What did you eat?" (en) / "O que você comeu?" (pt).
- Con plato: "Mi reseña de [*Nombre del plato*]" — nombre en `<em className="italic">` (Cormorant italic).
- `titlePrefix` key nueva en compose namespace de los 3 idiomas.

### 5. Keyframes en globals.css
- `cc-celebrate-overlay-anim` (fade, siempre activo — no es transform).
- `cc-celebrate-check-anim` y `cc-celebrate-text-anim` dentro de `prefers-reduced-motion: no-preference`.
- Easing `--ease-spoon` para el check (bounce de marca).

## Keys i18n nuevas

### compose namespace (es/en/pt)
- `title` → voz editorial ("¿Qué comiste?", etc.)
- `titlePrefix` → prefijo cuando hay plato
- `celebrationKicker`, `celebrationMessage`
- `advancedModeTitle`, `advancedModeDesc`

### restaurant.dishReviewForm namespace (es/en/pt)
- `advancedModeTitle`, `advancedModeDesc`

## Audit mobile (aplicado en sesión)
- M-A1 Medio: `aria-live="assertive"` → corregido a `polite`. CERRADO.
- M-A2/M-A3/M-A4/M-A5: todos Bajos, hipótesis o cosméticos. ABIERTOS como backlog.

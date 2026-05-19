---
name: project_profile_stats_audit_397ca19
description: Auditoría del rediseño de barra de stats e ReputationStrip en /u/[userId] — commit 397ca19
metadata:
  type: project
---

Auditoría del rediseño de ProfileHeader stats bar + ReputationStrip en commit 397ca19.

**Decisiones confirmadas como correctas (no re-flag):**
- Tokens semánticos sin hardcodes: border-border-subtle, divide-border-subtle, surface-subtle, text-text-primary/muted usan la cadena neutral que se invierte en .dark → paridad garantizada sin dark: explícitos
- Cormorant en números de stats: conforme con brand-identity-v2.md §7 (rating number, stat count)
- tabular-nums en número y en ReputationStrip → correcto
- hover:bg-surface-subtle/60 y active:bg-surface-subtle → feedback táctil correcto para mobile
- focus-visible con --focus-ring token → correcto en ambos modos
- ReputationStrip: número en text-text-primary (no terracota) es semánticamente correcto (es un count neutro, no un rating highlight como en CategoryChip donde el avg va en terracota)
- Patrón [color:var(--color-terracota)]/8 y /30 en Tailwind 4: patrón establecido en 17 lugares del codebase
- border-y de la barra con divide-x: lenguaje editorial (Letterboxd-style) válido para Palato, no es desviación de Instagram — es identidad propia justificada

**Hallazgos abiertos:**
1. [MEDIO] HTML inválido: `<button>` hijo directo de `<dl>`, `<dt>/<dd>` hijos de `<button>` — ProfileHeader.tsx:131,343-364. El DOM puede reordenarse en algunos parsers; AT lee "reseñas 47 reseñas" (dt duplicado). Fix: envolver cada Stat en `<div>` dentro del dl, o usar `aria-label` en el button y eliminar dt/dd internos.
2. [MEDIO] Skeleton de LoadingView no representa la nueva barra de stats — PublicProfileClient.tsx:431-434 usa `flex gap-6` con 3 pills, pero el componente real usa `grid grid-cols-3 divide-x border-y`. Genera layout shift visual al hidratarse.
3. [BAJO-MEDIO] Sin formateo de números grandes en stats: `{value}` crudo — "100000" a 24px Cormorant en 125px de ancho (1/3 del mobile). No hay abreviación K/M.
4. [hipótesis] Contraste text-text-muted (#7A6A5D) sobre crema (#F7F1E8) en el label de 11px uppercase: estimado ~4.83:1 — pasa WCAG AA pero con margen estrecho. Verificar con DevTools en ambos modos.
5. [BAJO] faCircleCheck a text-[10px] en ReputationStrip puede ser muy pequeño para un badge de credibilidad. Consistente con CategoryChip pero potencialmente sub-legible.
6. [BAJO] gap-0 en el `<dd>` del Stat: número y label se tocan sin gap mínimo. gap-0.5 (2px) es más cercano a la convención Instagram.
7. [BAJO] Tracking en números de stats: ausente. brand-identity-v2.md sugiere tracking-tight para Cormorant display. No es obli­gatorio para stat counts pero mejoraría la estética editorial.

**Why:** Para no re-auditar lo ya analizado en futuras sesiones sobre ProfileHeader.
**How to apply:** En el próximo audit de /u/[userId] o ProfileHeader, partir desde estos hallazgos abiertos.

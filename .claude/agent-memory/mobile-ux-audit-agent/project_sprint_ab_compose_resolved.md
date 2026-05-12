---
name: Sprint A+B compose — hallazgos resueltos y estado post-pase
description: Qué fue arreglado en el sprint A+B del wow-ux-architect sobre el flujo compose (mayo 2026)
type: project
---

Sprint A+B (wow-ux-architect, mayo 2026) resolvió los siguientes críticos/altos previos:

RESUELTOS (verificados estáticamente):
- Photo remove button: h-6 w-6 (24px) → h-11 w-11 (44px) con -right-2 -top-2. Crítico anterior → CERRADO.
- inputBase text-sm → text-base sm:text-sm: todos los inputs del form (price, date, companyOther, RestaurantAutocomplete, DishAutocomplete). Crítico anterior → CERRADO.
- StarRating interactive: p-0 → p-1 en modo interactivo → 44px efectivo. Crítico anterior → CERRADO.
- Compose draft autosave: writeComposeDraft con debounce 600ms en ComposeClient. Crítico anterior → CERRADO.
- Submit sticky bar: publish button ahora es sticky bottom-0 footer. Alto anterior → CERRADO.
- viewport-fit=cover: viewportFit: 'cover' en app/[locale]/layout.tsx viewport export. Medio anterior → CERRADO.
- StarRating showValue: nueva prop, Cormorant text-2xl al lado de estrellas, alineación OK.
- Header dinámico: line-clamp-2 con t('titleWithDish') — funciona en 320px y en pt.
- submitBlockReason: texto inline bajo sticky bar — correctamente condicionado.
- Suspense fallback: LoadingView exportada y usada en page.tsx.

PENDIENTES POST-SPRINT (no resueltos):
- Contraste azafran + text-inverse = 2.89:1: ALTO. Afecta TechnicalPillars neutral y SegmentedSelect positive/neutral.
- Toast action button ~18px: ALTO. Toast.tsx action sin padding/height — primer uso en compose publish.
- Photo tile button overlap 28px: MEDIO. -right-2 -top-2 con 44px botón solapa tile adyacente.
- Empezar de cero h-10: BAJO. 40px en botón destructivo secundario.
- Sticky bar z-30 vs BottomNav z-40: PREEXISTENTE. Hipótesis — pedir verificación en device real.

**Why:** Para no re-auditar hallazgos ya cerrados en pasadas futuras.
**How to apply:** Si se audita compose, estos críticos ya no deben flaggearse. Los pendientes sí.

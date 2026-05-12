---
name: Social design audit — hallazgos aplicados 2026-05-09
description: Hallazgos del social-design-audit-agent implementados el 2026-05-09. Roles semánticos de color, jerarquía de imagen en PostCard, wordmark, tipografía bio.
type: project
---

Hallazgos implementados en sesión 2026-05-09 (post quick-wins técnicos del social-design-audit-agent):

**Commits aplicados:**
1. `b2d874b` — SegmentedSelect: `positive` → Albahaca (era Azafrán, rol incorrecto)
2. `158e0e8` — PostCard: PostMedia antes del DishDecisionBlock (imagen como hero)
3. `342a5af` — TopNav wordmark: gradiente Azafrán → Azafrán-light con bg-clip-text
4. `c88a1a3` — ProfileHeader bio: Cormorant italic → DM Sans (legibilidad en body largo)
5. `3d8a6fb` — Card editorial: agrega rounded-xl (consistencia con flat/elevated)
6. `8e9cb95` — DishDecisionBlock ScoreBadge: 3 tonos (<3 Páprika / 3-4.4 neutro / ≥4.5 Albahaca)
7. `fcdebbd` — BottomNav labels: `uppercase tracking-[0.12em]` en todos los items

**Decisiones de diseño tomadas:**
- SegmentedSelect `tone="neutral"` usa Azafrán (CTA primario). `tone="positive"` usa Albahaca (confirmación). La distinción es semánticamente correcta según brand-identity-v2.md §2.3.
- PostMedia como hero: la foto va inmediatamente después del PostHeader, antes del DishDecisionBlock y PostBody. Convención establecida, alineada con Letterboxd/Beli.
- Wordmark gradiente sólido (no animado). `text-transparent` con gradiente funciona en dark mode porque los tokens crudos cambian vía `.dark`.
- Cormorant italic queda reservada para: nombres de platos en reviews, taglines. NO para bio de usuario ni párrafos largos.
- Card `editorial` sin consumidores actuales con expectativa de esquinas rectas — se documenta que si se necesita rectangularidad, crear variante `editorial-flush`.
- ScoreBadge escala 1-5 confirmada en tipos (score: number en ReviewPost). Umbral inferior <3 (no ≤2) para cubrir 2.5 y similares.

**Pendiente abierto:**
- [hipótesis] Bajo — BottomNav FAB label "PUBLISH" en iPhone SE (375px) puede quedar ajustado con tracking 0.12em en uppercase. Verificar en device real. Si corta, reducir a tracking-[0.08em] solo en la label del FAB central.
- MEDIO #5 (OwnerDashboardClient filtros sentiment) no aplicado en esta sesión — requería lectura del archivo completo que se marcó XL para otra sesión.

**Why:** Roles semánticos de color son críticos para que el usuario interprete la UI sin pensar (DMMT). PostMedia como hero es el cambio de mayor ROI emocional de la sesión — el producto reseña platos, la foto es el protagonista.
**How to apply:** En futuros audits, no re-flageear estos hallazgos como drift preexistente. El drift de OwnerDashboardClient filtros sentiment sigue abierto.

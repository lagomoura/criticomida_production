# WOW UX Architect — Memory Index

## Marca y sistema visual
- [Palato brand v2 aplicada](project_brand_v2_applied.md) — tokens Especiería en globals.css, fuentes DM Sans + Cormorant cargadas, dark mode via .dark class
- [Drift visual conocido en home — post Sprint 1+2](project_home_drift.md) — hallazgos cerrados y pendientes del audit 2026-05-08

## Decisiones aprobadas y patrones registrados
- [Stats perfil — patrón Instagram](project_profile_stats_instagram.md) — 2026-05-17: barra 3-col grid, tira ReputationStrip, onOpenReviews + scroll suave, Stat simplificado sin rama div ni prop accent
- [B6 form compose — agrupación en 4 bloques](project_compose_b6_section_dividers.md) — 2026-05-08: SectionDivider kicker-azafrán, 4 bloques semánticos, keys i18n sectionDish/sectionOpinion/sectionContext/sectionDetails
- [Modal dirty close guard — Sub-sprint 2](project_modal_dirty_guard.md) — 2026-05-08: useDirtyCloseGuard hook, banner inline, thresholds y keys i18n en ambos modales de reseña
- [Sprint 1+2 home aplicados](project_sprint1_sprint2_applied.md) — cambios implementados el 2026-05-08, pendientes de commit por el usuario
- [Sprint A+B perfil /u/[userId] aplicados](project_profile_sprint_applied.md) — cambios implementados 2026-05-08: tap targets, bio expandible, FollowButton con hover-unfollow+animación, Avatar mejorado, fix i18n preexistente
- [Sprint settings aplicado](project_settings_sprint_applied.md) — cambios implementados 2026-05-08: token drift, skeleton, logout inline, ThemeToggle pill, toast en EditProfileForm, Button.danger
- [Sprint A+B compose aplicados](project_compose_sprintAB_applied.md) — 2026-05-08: token drift TechnicalPillars/SegmentedSelect/StarRating, iOS zoom inputs, tap targets foto, header dinámico, toast con action, disabled feedback, copy editorial notas

- [Social design audit aplicado — 2026-05-09](project_social_design_audit_applied.md) — roles semánticos color, PostMedia hero, wordmark gradiente, bio DM Sans, Card editorial, ScoreBadge 3 tonos, BottomNav labels

## Patrones WOW validados
- [Ola 3 WOW compose aplicada](project_ola3_wow_applied.md) — 2026-05-16: overlay celebratorio, h1 con voz, Cormorant en label nota essentials, encuadre modo avanzado

## Falsos positivos confirmados
(vacío — primera sesión)

## Drift conocido abierto (no atacar sin aprobación)
- OwnerDashboardClient filtros sentiment (Canela + Páprika como activos) — marcado MEDIO, postergado por el usuario (XL scope, sesión aparte)

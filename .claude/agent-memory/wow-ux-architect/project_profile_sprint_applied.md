---
name: Sprint A+B perfil /u/[userId] — cambios aplicados 2026-05-08
description: Registro de todos los cambios implementados en el pase de Sprint A y B del perfil público. Incluye patrones nuevos, fix preexistente de i18n, y deuda pendiente.
type: project
---

Sprint A+B aplicado en 2026-05-08 sobre la página `/u/[userId]`.

**Archivos modificados:**
- `app/components/social/PostHeader.tsx` — tap target ⋮ h-9→h-11 (44px)
- `app/[locale]/u/[userId]/PostActionsMenu.tsx` — botones Editar/Eliminar min-h-[44px], text-white→text-text-inverse en botón danger
- `app/components/social/ProfileHeader.tsx` — bio con line-clamp-3 + useState bioExpanded + CTA "Ver más/menos" (i18n), separadores · aria-hidden entre stats, logout degradado a botón sm con muted text + separador border-l
- `app/[locale]/u/[userId]/PublicProfileClient.tsx` — EmptyState self con icon faUtensils; unificado copy emptySelfAction = publishReview
- `app/[locale]/u/[userId]/EditPostModal.tsx` — useToast en handleSuccess (toast.success con keys social.editPost.savedTitle/savedDescription)
- `app/components/social/FollowButton.tsx` — reescrito con hover/focus state: idle=faCheck+following, hover=faUserMinus+unfollow, not-following=faUserPlus+follow; animación follow-pop motion-safe
- `app/components/ui/Avatar.tsx` — priority prop (auto en xl), sizes hint, removed unoptimized
- `app/globals.css` — keyframe @keyframes follow-pop (patrón motion-safe, consistente con cc-pop)

**Strings i18n nuevos:**
- `social.follow.unfollow`: es="Dejar de seguir", en="Unfollow", pt="Deixar de seguir"
- `social.editPost.savedTitle/savedDescription`: toast confirmación edición
- `profile.header.bioSeeMore/bioSeeLess`: toggle de bio
- `profile.publicProfile.emptySelfAction`: unificado a "Publicar reseña/Post review/Publicar resenha"

**Fix preexistente detectado y corregido:**
- `EditPostModal.tsx` usa namespace `social.editPost` pero las keys (`loadError`, `fallbackTitle`, `title`, `loadFailed`, `close`) solo existían en `profile.editPost`. Se mergearon al namespace correcto sin borrar el original.

**Deuda pendiente (no aprobada en este pase):**
- B6: breadcrumb/orientación contextual — diferido
- A4: ScoreBadge a 32px — diferido

**Why:** Sprint A+B de mejoras de calidad UX en perfil público.

**How to apply:** No re-flageear los items cerrados. Al auditar perfil en futuras sesiones, verificar que el FollowButton estado hover sea correcto en device real (táctil no tiene hover).

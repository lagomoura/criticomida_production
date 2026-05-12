# Mobile UX Audit Agent — Memory Index

## Repo Conventions
- [IconButton always has aria-label via required prop](project_iconbutton_arialabel.md) — never flag IconButton without checking ariaLabel prop; it's TypeScript-required
- [BottomNav has safe-area-inset-bottom](project_bottomnav_safearea.md) — confirmed via inline style; not a finding
- [Modal uses max-h-[calc(100dvh-2rem)]](project_modal_dvh.md) — confirmed dvh usage; not a 100vh finding
- [Optimistic UI confirmed for like/save](project_optimistic_ui.md) — usePostsInteraction hook implements optimistic toggle with rollback; not a finding
- [Owner dashboard draft autosave exists](project_owner_draft.md) — localStorage draft for owner review responses; compose flow autosave confirmed resolved in sprint A+B
- [PostMedia uses unoptimized on all next/image](project_postmedia_unoptimized.md) — all images in feed posts bypass AVIF/WebP optimization; flagged as Alto
- [No image compression before upload](project_no_image_compression.md) — handlePhotoAdd uses raw File; no canvas resize; flagged as Alto
- [Ghostwriter close button 32px — undersized](project_ghostwriter_close.md) — h-8 w-8 = 32px; Alto
- [Chip remove button 20px — undersized](project_chip_remove_undersized.md) — h-5 w-5 = 20px within Chip; Alto

## Resolved (Sprint A+B — no re-flag)
- [Sprint A+B compose — resueltos y estado post-pase](project_sprint_ab_compose_resolved.md) — photo remove, StarRating targets, iOS zoom, draft autosave, sticky submit, viewport-fit all fixed; what remains open

## Active Findings (pending fix)
- [Azafrán + text-inverse falla WCAG AA 2.89:1](project_azafran_contrast_fail.md) — TechnicalPillars neutral + SegmentedSelect positive/neutral; fix: text-text-primary instead of text-text-inverse on azafrán bg
- [Toast action button ~18px target](project_toast_action_target.md) — Toast.tsx action el button has no padding; first caller is compose publish "Ver reseña"

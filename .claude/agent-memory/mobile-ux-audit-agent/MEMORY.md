# Mobile UX Audit Agent — Memory Index

## Repo Conventions
- [IconButton always has aria-label via required prop](project_iconbutton_arialabel.md) — never flag IconButton without checking ariaLabel prop; it's TypeScript-required
- [BottomNav has safe-area-inset-bottom](project_bottomnav_safearea.md) — confirmed via inline style; not a finding
- [Modal uses max-h-[calc(100dvh-2rem)]](project_modal_dvh.md) — confirmed dvh usage; not a 100vh finding
- [Optimistic UI confirmed for like/save](project_optimistic_ui.md) — usePostsInteraction hook implements optimistic toggle with rollback; not a finding
- [Owner dashboard draft autosave exists](project_owner_draft.md) — localStorage draft for owner review responses; compose flow autosave confirmed resolved in sprint A+B
- [PostMedia uses unoptimized on all next/image](project_postmedia_unoptimized.md) — all images in feed posts bypass AVIF/WebP optimization; flagged as Alto
- [Image compression implemented — compressImage utility](project_no_image_compression.md) — compressImage.ts does background canvas compression (maxEdge 1600, q=0.82); fires after preview shown. NOT a finding; previously stale memory.
- [Ghostwriter close button 44px — confirmed OK](project_ghostwriter_close.md) — GhostwriterAssist.tsx:172 uses h-11 w-11; previously wrong memory; not a finding
- [Chip remove button now h-9 w-9 (36px)](project_chip_remove_undersized.md) — Chip.tsx:45 uses -mr-2 h-9 w-9; upgraded from h-7 w-7; still 8px below 44pt but within the chip visual container

## Resolved (Sprint A+B + Ola 1+2+3 — no re-flag)
- [Sprint A+B compose — resueltos y estado post-pase](project_sprint_ab_compose_resolved.md) — photo remove, StarRating targets, iOS zoom, draft autosave, sticky submit, viewport-fit all fixed
- RestaurantAutocomplete/DishAutocomplete clear buttons: h-11 w-11. CERRADO.
- Autocomplete inputs: h-11. CERRADO.
- Dropdown rows: min-h-[44px]. CERRADO.
- Category native select: eliminado de ComposeClient. CERRADO.
- ChipInput add button: h-11 w-11. CERRADO.
- Ghostwriter upload/reanalyze: min-h-[44px]. CERRADO.
- Toast action: min-h-[44px]. CERRADO.
- Toast dismiss: h-11 w-11. CERRADO.
- DishReviewForm sensación planilla: mode=essentials + progressive disclosure. CERRADO.

## Compose Re-Audit (commit cb0b8b2 — Ola 1+2+3)
- [Re-auditoría de validación post Ola 1+2+3](project_compose_audit_cb0b8b2.md) — estado por hallazgo, regresiones nuevas, veredicto planilla

## Compose Audit histórico (commit 210e297 — superseded)
- [Compose audit original](project_compose_audit_210e297.md) — SUPERSEDED por cb0b8b2

## Active Findings (pending fix — post Ola 1+2+3)
- [Terracota+Dorado sobre blanco fallan WCAG AA](project_azafran_contrast_fail.md) — TechnicalPillars neutral(3.70:1) + positive(2.20:1); SegmentedSelect ídem; WouldOrderAgain Sí(dorado 2.20:1); fix: text-espresso en fondos de marca
- [Button size=md h-10 = 40px — 4px below HIG](project_select_height.md) — Button.tsx:30; afecta Cancel y Publish en sticky bar de ComposeClient; Medio
- [ChipInput preset pills min-h-[36px] — 8px below HIG](project_chipinput_add_btn.md) — ChipInput.tsx:143; Medio persistente
- [Anonymous checkbox h-4 w-4 en modo avanzado](project_anonymous_checkbox.md) — ReviewFormBody.tsx:745; label wrapper ayuda pero hit area discutible; Bajo
- [GhostwriterAssist applyBlurb button py-1 ~24px](project_compose_audit_cb0b8b2.md) — GhostwriterAssist.tsx:~276; regresión Ola 3; Alto
- [GhostwriterAssist suggestion chips px-2.5 py-1 ~24px](project_compose_audit_cb0b8b2.md) — GhostwriterAssist.tsx:~434; regresión Ola 3; Medio

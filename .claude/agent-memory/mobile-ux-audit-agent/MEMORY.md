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
- [Chip remove button 28px — undersized](project_chip_remove_undersized.md) — Chip.tsx:45 uses h-7 w-7 (28px); no padding; 16px below Apple HIG 44pt; Alto; confirmed audit 89afade

## Resolved (Sprint A+B — no re-flag)
- [Sprint A+B compose — resueltos y estado post-pase](project_sprint_ab_compose_resolved.md) — photo remove, StarRating targets, iOS zoom, draft autosave, sticky submit, viewport-fit all fixed; what remains open

## Compose Audit (commit 210e297)
- [Compose audit completo — hallazgos y falsos positivos](project_compose_audit_210e297.md) — audit del flujo compose/review; StarRating borderline OK; inputs h-10 = 40px; dropdown rows ~32-36px; DishReviewForm modo=all = planilla; autocomplete clear buttons son h-11 (OK)

## Active Findings (pending fix)
- [Azafrán + text-inverse falla WCAG AA 2.89:1](project_azafran_contrast_fail.md) — TechnicalPillars neutral + SegmentedSelect positive/neutral; fix: text-text-primary instead of text-text-inverse on azafrán bg
- [Toast action button min-h-[36px] — below 44px](project_toast_action_target.md) — Toast.tsx:205 has min-h-[36px] only, no padding to reach 44px; "Ver reseña" post-publish first caller; Alto
- [Chip remove button 28px — undersized](project_chip_remove_undersized.md) — Chip.tsx:45 h-7 w-7; Alto; every pros/cons/tags chip in compose flow
- [Category select — native HTML select, not SegmentedSelect](project_category_native_select.md) — ComposeClient.tsx:470 uses <Select> (native HTML select) for 52-item category list; mobile-hostile; Medio
- [Anonymous checkbox 16px — no expanded hit area](project_anonymous_checkbox.md) — ReviewFormBody.tsx:693 h-4 w-4 native checkbox; label wraps it but effective hit area debatable; Bajo
- [RestaurantAutocomplete clear button 28px](project_restaurant_clear_btn.md) — RestaurantAutocomplete.tsx:315 inline-flex h-7 w-7 clear button; 16px below HIG; Alto
- [DishAutocomplete clear button 28px](project_dish_clear_btn.md) — DishAutocomplete.tsx:251 same h-7 w-7 clear button; Alto
- [ChipInput add button 40px — 4px below HIG](project_chipinput_add_btn.md) — ChipInput.tsx:122 h-10 w-10 = 40px; 4px below 44pt floor; Medio (secondary action)
- [Ghostwriter upload button 28px target](project_ghostwriter_upload_btn.md) — GhostwriterAssist.tsx:193 inline button px-3 py-1.5 with text-xs; estimated ~28-30px height; Alto
- [Toast dismiss button 28px](project_toast_dismiss_btn.md) — Toast.tsx:215 h-7 w-7 dismiss X; Alto
- [Category field orden: posición 3 antes del body — fricciona el flujo](project_category_field_position.md) — category shown before photo/rating, adds cognitive load before emotional capture; Medio redesign
- [ComposeClient submit bar: Cancel left, Publish right — thumb zone OK but Cancel overshadowed](project_submit_bar_layout.md) — sticky bar bottom-right; Publish primary right (thumb-friendly); Cancel ghost left; OK pero sin icon diferenciador de riesgo
- [Select h-10 — 40px — 4px below HIG](project_select_height.md) — Select.tsx:57 h-10; applies to category Select in compose; Medio

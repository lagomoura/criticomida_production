---
name: Brand Identity Documents
description: Where to find CritiComida brand identity docs and what palette/fonts are actually applied
type: reference
originSessionId: b590f4d9-de97-4c1c-a725-8cafca7f28a5
---
**`docs/brand-identity.md`** — v1 (old). Pink `#ef7998` + Source Sans 3. Kept for voice/tone sections only; visual criteria superseded.

**`docs/brand-identity-v2.md`** — v2 (live, reconciled with code on 2026-04-22). Paleta **Especiería** + Cormorant Garamond + DM Sans. The doc's color sections, typography, CSS vars (§11) and changelog (§14) now mirror `app/globals.css` exactly.

**`docs/design-system-v1.md`** — component contracts + semantic tokens for the social UI kit (PostCard, IconButton, etc.). Uses `--color-*` and `--neutral-*` token names (not the old `--brand-*` / `--n-*` — those were removed during the 2026-04-22 reconciliation).

Actual palette in code (`app/globals.css`):
- `--color-azafran` `#D4870A` — marca/CTAs/links (primary action)
- `--color-paprika` `#C03B28` — errores/estados negativos (NOT the primary action)
- `--color-albahaca` `#3A6645` — ratings ≥9, confirmaciones, follow activo
- `--color-canela` `#8B5E3C` — acento cálido, categorías
- `--color-crema` `#F8F4EE` — fondo de página
- `--color-carbon` `#1A1714` — texto principal

Fonts loaded via `next/font/google` in `app/layout.tsx`: DM Sans (300/400/500) + Cormorant Garamond (300/400/500, normal + italic). Exposed as `var(--font-sans)` and `var(--font-display)`.

---
name: IconButton always has aria-label via required prop
description: IconButton requires ariaLabel as a TypeScript non-optional prop — never flag aria-label missing on IconButton
type: project
---

IconButton.tsx enforces ariaLabel as a required prop at the TypeScript level (line 8: `ariaLabel: string`). Every usage in the codebase must pass it or the build fails. This is a validated false-positive exclusion.

**Why:** Flagging aria-label on IconButton would be a false positive — the TS contract guarantees it.

**How to apply:** When auditing aria-label coverage, skip IconButton — check only bare <button> elements with icon-only children.

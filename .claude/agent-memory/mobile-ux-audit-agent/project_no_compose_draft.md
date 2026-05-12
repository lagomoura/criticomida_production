---
name: No autosave/draft in compose hot path
description: ComposeClient.tsx has no localStorage/sessionStorage/IndexedDB draft persistence for the review being composed
type: project
---

ComposeClient does not persist any form state between sessions or on accidental navigation. The owner dashboard (OwnerDashboardClient + lib/utils/owner-draft.ts) has a working localStorage draft mechanism, but ComposeClient (the primary user-facing compose flow) does not.

**Why:** This is a Crítico finding — the hot path is "user eating at table, writes review, gets interrupted by a call or phone lock" and loses all work.

**How to apply:** When auditing compose flows, the absence of draft persistence is always Crítico. The fix pattern (localStorage keyed by restaurantId + dishId) already exists in the codebase at app/lib/utils/owner-draft.ts.

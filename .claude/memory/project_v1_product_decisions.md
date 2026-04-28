---
name: CritiComida v1 product decisions (2026-04-24)
description: Decisiones de producto tomadas al atacar pendings-v1.md — edit comment, reputación, guardados públicos
type: project
originSessionId: 1f3e12c1-88f1-4c49-9fb9-03358b33b737
---
Decisiones tomadas por el usuario el 2026-04-24 al iniciar el cierre de `docs/pendings/pendings-v1.md`:

- **PEND-3 (moderación)** — Edición de comentario en ventana corta: **SÍ** entra en v1.
- **PEND-4 (reputación)** — Tags/badges de reputación en perfil: **SÍ** entran en v1.
- **PEND-15 (perfil)** — Tab de guardados públicos en `/u/[userId]`: **SÍ** entra en v1 (guardados son públicos, no privados).
- **Resto de decisiones abiertas**: Claude decide con criterio del spec y avisa al usuario.
- **Testing**: backend con pytest integración, frontend con verificación manual en navegador (Playwright MCP). Tests de frontend automáticos van al final (PEND-8).

**Why:** evitar repreguntar en cada PEND y tener referencia cuando se escriban los cambios.
**How to apply:** al entrar a PEND-3/4/15, NO volver a consultar el alcance; implementar directamente según estas decisiones. Para decisiones no listadas aquí, decidir con criterio del spec y notificar al usuario.

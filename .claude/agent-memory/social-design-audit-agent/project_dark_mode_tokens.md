---
name: Dark mode — bloque .dark y estrategia de tokens
description: El bloque .dark en globals.css reasigna los neutrales; los cromáticos no cambian intencionalmente según brand-identity-v2.md §13
type: project
---

El bloque `.dark { }` en `app/globals.css` (líneas 1818-1837) reasigna los `--neutral-*` (100–900).
Los tokens cromáticos (Azafrán, Páprika, Albahaca, Canela) NO se reasignan — esto es intencional según brand-identity-v2.md §13: "Azafrán, Páprika, Albahaca y Canela no cambian — funcionan en ambos fondos."

Los tokens semánticos (`--text-primary`, `--surface-page`, etc.) heredan automáticamente porque consumen `--neutral-*`.

El `color-scheme: dark` se declara DENTRO del bloque `.dark { }` (línea 1819) pero NO en `metadata.viewport.colorScheme` del layout, lo que puede dejar scrollbars en modo light cuando dark está activo.

**Why:** Estrategia de dark mode via inversión de neutrales + tokens semánticos como capa de indirección. No requiere `dark:` en cada componente siempre que el componente use tokens semánticos.

**How to apply:** Al auditar, verificar que componentes usen `bg-surface-*`, `text-text-*`, `border-border-*` en lugar de valores literales. Si usan literales, NO heredan el dark mode automáticamente.

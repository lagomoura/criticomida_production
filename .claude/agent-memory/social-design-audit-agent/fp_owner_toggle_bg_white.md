---
name: Falso positivo — bg-white en thumb del toggle del owner dashboard
description: bg-white en el thumb del toggle es correcto sobre fondo de color sólido (track oscuro/colorido garantiza contraste)
type: project
---

`OwnerDashboardClient.tsx` línea 405: thumb del toggle usa `bg-white`.
El track del toggle usa `bg-[var(--color-canela)]` (activo) o `bg-neutral-300` (inactivo).
El thumb blanco sobre ambos backgrounds tiene contraste suficiente.

Sin embargo, `bg-neutral-300` hardcoded en el track inactivo NO usa token semántico — eso SÍ es un hallazgo válido (C1 derivado, Medio).

**How to apply:** No flagear bg-white en el thumb como error de dark mode. Sí flagear bg-neutral-300 en el track inactivo como color hardcoded (debería ser bg-surface-subtle o bg-border-default).

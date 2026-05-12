---
name: Palato brand v2 aplicada
description: Estado actual del sistema visual v2 en código — tokens, fuentes, dark mode
type: project
---

La paleta Especiería (Azafrán/Páprika/Albahaca/Canela/Crema/Carbón) está completamente declarada en `app/globals.css` con tokens semánticos (`--text-*`, `--surface-*`, `--action-*`, `--border-*`). Las fuentes DM Sans y Cormorant Garamond se cargan en `app/[locale]/layout.tsx` vía `next/font/google`. Dark mode funciona con `.dark` en `<html>`.

**Why:** Migración completa de v1 (rosa/coral) a v2 (Especiería) ya completada en los tokens. Los alias legacy (`--mainPink`, `--primary-coral`, etc.) siguen en globals.css pero redirigen a los nuevos tokens — están marcados como DEPRECATED.

**How to apply:** No proponer nuevos colores fuera del sistema. Si falta un token, crearlo en globals.css documentado. Los alias legacy NO deben usarse en código nuevo — migrarlo al token semántico correspondiente.

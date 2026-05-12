---
name: Iconografía — única familia FontAwesome v6
description: FontAwesome Free v6 es la única familia de iconos del repo, documentada en brand-identity-v2.md §10
type: project
---

`brand-identity-v2.md §10`: "Continúa FontAwesome v6 (ya instalado). No agregar nuevas librerías."
Todos los componentes auditados usan `@fortawesome/free-solid-icons` y `@fortawesome/react-fontawesome`.
No hay instancias de lucide-react, heroicons, react-icons, ni SVG inline con familias distintas.

**How to apply:** No flagear mezcla de iconos — solo existe una familia. Verificar stroke/fill consistency (FontAwesome usa fill en su variante solid, outline en su variante regular — asegurar consistencia de variante).

---
name: Owner dashboard — sin sidebar SaaS, ruta anidada
description: El owner dashboard vive bajo /restaurants/[id]/owner/ — no tiene sidebar fija; es una página con cc-container
type: project
---

El owner dashboard está en `app/[locale]/restaurants/[id]/owner/OwnerDashboardClient.tsx`.
Usa `cc-container` (max-width 72rem) sin sidebar lateral fija.
El layout es una columna única con secciones apiladas.

Esto NO cumple el patrón SaaS ideal (sidebar izquierda fija + main content), pero puede ser una decisión de producto: el owner accede desde el mismo dominio del restaurante, no desde un portal separado.

**Why:** El owner dashboard no es un portal SaaS independiente — es una vista de gestión anidada dentro del perfil público del restaurante.

**How to apply:** Flagear la falta de sidebar como hallazgo (O24) pero con severidad degradada a Medio (no Alto) dado que el contexto es híbrido — no es un portal SaaS puro como Linear. El owner llega desde la página del restaurante, no desde un dashboard independiente.

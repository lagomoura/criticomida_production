---
name: project-gate-baseline
description: Estado del producto en el gate inicial 2026-05-12 — veredicto y caveats
metadata:
  type: project
---

Gate completo realizado el 2026-05-12. HEAD: ad2c718. Branch: main.

**Veredicto: GO-WITH-CAVEATS**

Sin Críticos. Altos en dimensiones degradantes (no gating).

Caveats pendientes de resolución:
1. **Alto-Perf: bbox /in-bbox con limit=500** — `restaurants.py:133`, endpoint de mapa acepta hasta 500 restaurantes en una sola query. Sin caché. Riesgo de latencia y DB overload en mapas con viewport grande.
2. **Alto-Perf: /api/chat/conversations/{id}/messages con limit=500** — `chat.py:392`, 500 mensajes en una query. En conversaciones largas del Business agent puede ser pesado.
3. **Alto-Sec: /api/generate-category-image sin auth ni rate-limit** — `app/api/generate-category-image/route.ts`, Next.js route handler que llama a fal.ai con FAL_KEY. Sin caller activo en el FE, pero expuesto públicamente. Riesgo de key abuse si se descubre el endpoint.
4. **Alto-Docs: ENVIRONMENTS.md desactualizado** — No documenta `ASYNC_JOB_WORKER_ENABLED` ni `AGENT_LOOP_CACHE_DISABLED` (kill switch de context caching). No crítico pero aumenta el costo de un incidente.
5. **Alto-Obs: Sentry client config faltante** — No hay `sentry.client.config.ts` (sólo `instrumentation-client.ts`). El patrón de Next.js 15 + @sentry/nextjs v10 usa `instrumentation-client.ts` — evaluar si hay cobertura real de client-side errors.
6. **Medio-Data: Migración 061 irreversible sin documentación en ENVIRONMENTS.md** — `downgrade()` lanza `NotImplementedError` explícito con instrucciones en el docstring. Documentado en la migración misma, pero no en el runbook operativo.
7. **Medio-Sec: backend security_headers.py incluye interest-cohort** — Deprecated en Chromium, genera warning en consola. Cosmético pero ruidoso.

**Why:** Primer gate completo del producto. No hay overrides anteriores.
**How to apply:** En el próximo gate, verificar si los caveats fueron resueltos. Si el usuario dice que resolvió alguno, verificar en el diff antes de descartarlos.

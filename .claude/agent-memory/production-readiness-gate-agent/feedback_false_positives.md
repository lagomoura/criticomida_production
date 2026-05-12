---
name: feedback-false-positives
description: Patrones que NO son hallazgos en este repo — anti-falsos-positivos confirmados
metadata:
  type: feedback
---

Patrones descartados como falsos positivos (confirmados en gate 2026-05-12):

1. `dangerouslySetInnerHTML` en layout.tsx (theme bootstrap inline script): es el patrón estándar de Next.js para dark-mode sin flash. No UGC.
2. `dangerouslySetInnerHTML` en LoginClient.tsx, RegistroClient.tsx, ForgotPasswordClient.tsx: strings de i18n con `<em>` para coloring. No UGC.
3. `dangerouslySetInnerHTML` en FeedWelcome.tsx: i18n string con `<em>` reemplazado con regex. No UGC.
4. `dangerouslySetInnerHTML` en PillarsSummary.tsx: i18n string con `{avg}` numérico `data.avg.toFixed(1)`. No UGC.
5. `except Exception: pass` en `auth.py:244`: es deliberado — email de verificación es best-effort. El registro no debe bloquearse por fallo del proveedor de email.
6. `except Exception:` en agent_loop.py líneas 205, 313: son para parseo de base64 de thought_signature — fallo es no-bloqueante por diseño.
7. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: key pública con restricción de dominio en Google Console. Legítima.
8. NEXT_PUBLIC_SENTRY_DSN: DSN de Sentry es público por diseño (no es un secret).
9. `GET /api/restaurants/*`, `GET /api/categories/*`, `GET /api/dishes/*` sin auth: endpoints de catálogo público, intencional.
10. `GET /api/chat/sommelier/preview` sin auth: endpoint de preview del chatbot para visitantes anónimos, intencional y documentado.
11. `except Exception:` en chat/tools/search.py:332 y vision.py:300: degradan silenciosamente el vector de embedding, no operaciones críticas.

**Why:** Confirmados en análisis estático. Tienen comentarios en código justificando la decisión.
**How to apply:** No reportar en futuros gates si las líneas no cambiaron.

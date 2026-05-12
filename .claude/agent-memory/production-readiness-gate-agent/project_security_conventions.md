---
name: project-security-conventions
description: Convenciones de seguridad verificadas en el repo — no re-flaggear en gates futuros si el área no cambió
metadata:
  type: project
---

Convenciones confirmadas en gate 2026-05-12 (HEAD ad2c718):

- CORS con allowlist explícita en `settings.cors_origins_list` — NEVER `["*"]`. No flaggear como amplitud en prod.
- JWT_SECRET: guard en `config.py` `model_validator` rechaza placeholder/corto fuera de development/test. Funcionando correctamente.
- Cookies: `httpOnly=True`, `SameSite="none"` + `Secure=True` cuando `COOKIE_SECURE=True` (prod). Correcto.
- `require_role(UserRole.admin)` en todos los endpoints de `admin.py`. Verificado.
- `assert_verified_owner` en todos los endpoints de `owner_dishes.py`, `owner_content.py`. Verificado.
- Business agent: `restaurant_scope_id` validado con `assert_verified_owner` antes de entrar al loop. Correcto.
- `dangerouslySetInnerHTML` en FE: 6 usos, NINGUNO con UGC o output de LLM. Son: theme bootstrap script (layout.tsx), i18n strings con `<em>` (FeedWelcome, LoginClient, RegistroClient, ForgotPasswordClient), i18n string con `{avg}` (PillarsSummary). Todos son strings de traducción controlados, no UGC.
- LLM output en chat: renderizado con `react-markdown` + componentes seguros, NO `dangerouslySetInnerHTML`. Correcto.
- `send_default_pii=False` en Sentry backend y frontend. Correcto.
- Rate limiting: `slowapi` con `user_or_ip_key`, `key_style="endpoint"`. Límites bien definidos para auth, chat, claims, comentarios.

**Why:** Confirmado en análisis estático completo del repo.
**How to apply:** En gates futuros, si estas áreas no cambiaron (no hay diff en auth.py, config.py, middleware/), no re-auditar — sólo verificar que el área no tiene cambios nuevos.

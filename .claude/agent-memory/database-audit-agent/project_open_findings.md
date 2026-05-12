---
name: Hallazgos abiertos del audit 7305ed7 + social layer audit a62a03a
description: Hallazgos pendientes de fix — re-auditar cuando se cierren
type: project
---

## ALTO #1 — Cola persistente para fire-and-forget (2026-05-08)

Callers afectados (críticos):
- embeddings_service.py:391 (schedule_reembed_review)
- sentiment_service.py:270 (schedule_analyze_review)
- routers/reviews.py:259-260, 453-457
- routers/posts.py:361

Plan decidido: tabla async_job (migración 053) con worker loop en main.py startup.
ENUMs: async_job_kind ('embed_review', 'sentiment_review'), async_job_status ('pending','running','done','failed').
Índices: ix_async_job_pending (parcial WHERE status IN ('pending','running')) + ix_async_job_pending_dedup (unique WHERE status='pending').

**Why:** Railway SIGTERM puede matar tareas en vuelo; reviews quedan sin embedding sin retry.
**How to apply:** re-auditar embeddings_service + sentiment_service + reviews router después de aplicar el fix.

## ALTO #2 — Image.uploaded_by_user_id (2026-05-08)

Archivo: models/image.py (campo ausente), routers/images.py:88-94 (hardcoded admin-only)
Plan: migración 054, FK nullable ON DELETE SET NULL, índice partial WHERE NOT NULL.
Backfill parcial: solo dish_cover vía dishes.created_by.

**Why:** usuario que sube foto no puede borrarla; solo admin puede.
**How to apply:** re-auditar images.py + image.py después de aplicar el fix.

## ALTO #3 — N+1 escritura en image_cleanup (2026-05-08)

Archivo: services/image_cleanup.py:17-23
Fix: bulk DELETE WHERE id IN (...) + loop os.remove por separado.
Puede ir en el mismo PR que ALTO #2.

---

## Hallazgos del audit social (a62a03a, 2026-05-10)

### ✅ CERRADO — CRÍTICO (social safety) — user_blocks y user_mutes

Aplicado en **migración 055** (2026-05-10) y stampeado en dev. Tablas con PK compuesta + check constraint anti-self + ON DELETE CASCADE. Índice partial en `user_blocks(blocked_id)`. Sin índice en `user_mutes(muted_id)` por baja necesidad. Service centralizado en `app/services/safety_service.py` con cuatro callers: routers/safety.py, routers/follows.py (404 al follow tras block), services/notification_service.py (guard en cada `record_*_notification`), routers/feed.py (`excluded_author_ids_subquery` con `union_all` para evitar el bug de `CompoundSelect.union()` no chainable). Auto-unfollow bidireccional al bloquear. 15/15 tests integration en test_safety.py + 51 tests adyacentes sin regresión. Sommelier `get_dish_detail` queda con caveat documentado en docs/chatbot.md (el agente parafrasea sin atribuir, no hay doxing surface).

### ✅ CERRADO — MEDIO #1 / #1b / #1c — Índices hot-path

Aplicado en **migración 056** (2026-05-10). Cuatro índices: `ix_follows_following_id (following_id, created_at DESC)`, `ix_notifications_recipient_created (recipient_user_id, created_at DESC)`, `ix_notifications_unread (recipient_user_id) WHERE read_at IS NULL` partial, `ix_bookmarks_user_created (user_id, created_at DESC)`. Sin CREATE INDEX CONCURRENTLY porque las tablas son chicas y la migración corre en el entrypoint pre-uvicorn. Verificados con `pg_indexes` en dev. 42 tests integration sin regresión post-migración.

### ✅ CERRADO — BAJO #2 — comments.user_id SET NULL

Aplicado en **migración 057** (2026-05-10). Política decidida con el usuario: SET NULL + mantener body como anónimo (mismo criterio que dish_reviews.user_id de migración 051, preserva el contexto del hilo). FK recreada con ON DELETE SET NULL, columna pasada a nullable. FE renderiza "Anónimo" cuando `comment.author` viene null (CommentItem.tsx + `social.post.anonymous` i18n). `_base_select` en routers/comments.py cambió a outerjoin para no perder los anónimos. `can_report` ahora exige `author is not None`. 19 tests (comments + notifications) verde sin regresión.

### ✅ CERRADO — Sommelier filter (follow-up del audit social)

Aplicado en commit que toca chat/tools/search.py + registry.py. `make_get_dish_detail_tool` recibe `user_id` opcional; el handler dropea reviews bloqueadas/muteadas en memoria antes de armar los top_reviews. Solo Sommelier propaga `user_id`; Business deliberadamente no (diagnóstico interno del owner). 300/300 unit tests siguen verdes.

---

## Convenciones sociales confirmadas (2026-05-10)

- Follows asimétrico (Twitter/Instagram style) — correcto y ya implementado.
- restaurant_scope_id aplica SOLO al agente Business en chat_conversations — NO aplica a la capa social.
- Users son globales (sin multi-tenant en el grafo social).
- Soft-delete selectivo: comments usan removed_at, chat usan archived_at, acciones puras (likes, follows) usan hard-delete.
- Feeds son fan-out on read (leer en tiempo real via joins) — correcto para escala actual de Palato.

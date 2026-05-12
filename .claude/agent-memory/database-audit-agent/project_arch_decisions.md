---
name: Decisiones arquitectónicas aceptadas
description: Decisiones sobre create_task fire-and-forget, backfill nullable para Image, cola persistente
type: project
---

## asyncio.create_task fire-and-forget

Al 2026-05-08, el repo usa create_task fire-and-forget en 4 lugares:
1. embeddings_service.py:391 — schedule_reembed_review (CRITICO: escribe embeddings)
2. sentiment_service.py:270 — schedule_analyze_review (CRITICO: escribe sentiment)
3. chat_title_service.py:243 — schedule_generate_title (COSMÉTICO: título de chat)
4. reservations.py:181 — envío de email al owner (NOTIFICACIÓN: reserva ya persistida)

Decisión pendiente de aplicar: migrar (1) y (2) a cola persistente `async_job` con worker loop.
Los casos (3) y (4) pueden mantenerse como create_task siempre que se guarde la referencia.

**Why:** Railway envía SIGTERM en cada redeploy; uvicorn no garantiza que las tareas en vuelo completen. Sin cola persistente, reviews creadas en el momento del deploy quedan sin embedding.
**How to apply:** no volver a flaggear (3) y (4) como Alto — son Medio y Bajo respectivamente. (1) y (2) siguen siendo Alto hasta que el fix se aplique.

## Image.uploaded_by_user_id

Decisión de diseño: FK nullable (no not-null con backfill obligatorio).
- Backfill parcial posible solo para dish_cover via dishes.created_by (aproximación, puede ser incorrecto).
- Para restaurant_gallery, menu, chat_attachment: no hay backfill seguro — quedan NULL.
- NULL = solo admin puede borrar (no es regresión respecto al comportamiento actual).
- Patrón coherente con RestaurantOfficialPhoto.uploaded_by_user_id que ya es nullable.

**Why:** imágenes preexistentes sin actor conocido; forzar not-null requeriría backfill que no es posible para todos los entity_types.

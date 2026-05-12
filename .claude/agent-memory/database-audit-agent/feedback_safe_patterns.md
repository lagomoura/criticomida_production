---
name: Patrones seguros verificados en el repo
description: Patrones que NO deben ser flaggeados en futuras auditorías de este repo
type: feedback
---

Estos patrones aparecen en el código pero fueron verificados como seguros:

## text() en migraciones Alembic
`text("...")` con strings literales en `alembic/versions/*.py` son DDL controlados.
No hay interpolación de input de usuario. No flaggear como SQLi.

## asyncio.gather en scripts CLI
`asyncio.gather(...)` en `scripts/refresh_editorial_blurbs.py` y `scripts/backfill_sentiment.py`
son scripts de administración offline, no request handlers. El patrón es correcto ahí.

## BackgroundTasks de FastAPI
El repo usa `background_tasks.add_task(...)` (FastAPI nativo) en restaurants.py y dishes_social.py.
Este patrón es correcto — BackgroundTasks corre después de la response pero dentro del lifecycle
del request, con manejo de errores de FastAPI. No confundir con asyncio.create_task.

## Loop en image_cleanup
`for image in images: await db.delete(image)` en image_cleanup.py — N+1 de escritura real,
pero está en el path de borrado de entidades padre (low traffic). Flaggear como Alto, no Crítico.

**Why:** verificados en audit del commit 7305ed7 (2026-05-08).
**How to apply:** listarlos en "Falsos positivos descartados" si reaparecen en futuras auditorías.

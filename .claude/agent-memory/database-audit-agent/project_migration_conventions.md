---
name: Convenciones de migración del repo
description: Patrón idempotente de ENUMs, migración canon 031, uso de create_type=False
type: project
---

El repo usa un patrón consistente para ENUMs en migraciones Alembic:

- ENUMs se crean con `DO $$ BEGIN CREATE TYPE ... EXCEPTION WHEN duplicate_object THEN null; END $$;` para idempotencia.
- Las columnas que referencian el ENUM usan `PGEnum(..., create_type=False)` para evitar doble creación.
- Canon: `031_chat_agentic_foundation.py` — función helper `_create_enum_if_missing(name, *values)`.

Última migración al 2026-05-08: `052_invalidate_claim_email_tokens.py` (down_revision=051).
Cadena: ...049→050→051→052. Próximas disponibles: 053, 054.

**Why:** el repo usa Alembic con encadenamiento lineal, sin branches. Cada migración tiene down_revision explícito al anterior.
**How to apply:** cualquier nueva migración debe referenciar 052 como down_revision al momento de este audit. Verificar `alembic history` si hay dudas del estado real.

# Memory Index — database-audit-agent

- [Convenciones de migración del repo](project_migration_conventions.md) — patrón idempotente de ENUMs, canon 031, create_type=False
- [Decisiones arquitectónicas aceptadas](project_arch_decisions.md) — create_task fire-and-forget mantenido como Alto hasta migrar a cola; backfill nullable para uploaded_by
- [Patrones seguros verificados](feedback_safe_patterns.md) — text() en migraciones, asyncio.gather en scripts CLI, BackgroundTasks de FastAPI
- [Audit 7305ed7 — hallazgos abiertos](project_open_findings.md) — ALTO #1 (cola persistente, 4 callers), ALTO #2 (Image.uploaded_by_user_id), ALTO #3 (N+1 image_cleanup)

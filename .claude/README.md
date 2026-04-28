# Claude Code state — CritiComida

Estado compartido para que Claude Code pueda retomar el proyecto en otra
máquina sin perder contexto.

## Layout

```
.claude/
├── README.md            ← este archivo
├── skills/              ← skills locales del proyecto (frontend-design, vercel-react-best-practices)
├── agents/              ← agentes custom (frontend-react-architect)
├── agent-memory/        ← memoria por-agente
├── memory/              ← auto-memory del proyecto (lo que Claude recuerda entre sesiones)
└── plans/               ← plans históricos generados durante sesiones de planificación
```

## Qué se commitea y qué no

**Tracked (compartido entre máquinas):**

- `skills/` — skills del proyecto. La fuente canónica vive en `skills-lock.json`
  en la raíz del repo; el contenido en `skills/` es el resultado de su instalación.
- `agents/` — agentes custom (definidos por el usuario, ej. `frontend-react-architect`).
- `agent-memory/` — memoria persistida por cada agente entre runs.
- `memory/` — **auto-memory del proyecto**: hechos sobre el usuario, feedback,
  decisiones de producto, estado de la DB, deploys, brand. `MEMORY.md` es el
  índice; cada `*.md` es una entrada independiente. Claude lo lee al inicio
  de cada conversación.
- `plans/` — plans generados por el plan-mode durante sesiones complejas.
  Útiles como historial de decisiones arquitectónicas.

**Gitignored (locales por máquina):**

- `settings.local.json` — permisos `Bash(...)` allowlist por máquina. Puede
  contener URLs de DB local (`postgresql://...`). Cada máquina lo regenera
  a medida que el usuario aprueba comandos.
- `.credentials.json`, `cache/`, `image-cache/`, `file-history/`, etc. —
  artefactos locales de la CLI.

## Restaurar en una máquina nueva

1. `git clone` + `git submodule update --init` (backend).
2. Instalar Claude Code CLI (https://docs.claude.com/en/docs/claude-code).
3. `cd` al repo. Claude Code detecta automáticamente `.claude/` y carga skills,
   agents y agent-memory.
4. La auto-memory en `.claude/memory/` queda dentro del repo. La CLI por
   defecto la busca en `~/.claude/projects/<repo-path-encoded>/memory/`.
   Para que la nueva máquina la consuma sin re-trabajar, después del clone
   hacé un symlink (o copia inicial):

   ```bash
   mkdir -p ~/.claude/projects/-home-USER-PATH-criticomida-nextjs
   ln -s "$(pwd)/.claude/memory" \
         ~/.claude/projects/-home-USER-PATH-criticomida-nextjs/memory
   ```

   (Reemplazá `USER-PATH` por la ruta absoluta del repo, con `/` → `-`.)
5. Plans: idem — symlink o copy `~/.claude/plans/` ← `.claude/plans/` si
   querés mantener el historial accesible desde el plan-mode.
6. `skills-lock.json` (raíz del repo) se reinstala automático cuando Claude
   Code arranca; las skills tracked en `.claude/skills/` son fallback offline.

## Auto-memory — qué hay actualmente

Ver `memory/MEMORY.md`. Resumen rápido:

- **project_criticomida**: contexto del producto (dish-focused).
- **project_db_state**: estado de la DB, esquema, credenciales seed dev.
- **project_deploy**: stack target Vercel + Railway.
- **project_open_issues**: features completadas y pendientes.
- **project_restaurant_profile_v2**, **project_dish_profile_v2**: estado de
  las páginas estrella.
- **project_social_migration**, **project_v1_product_decisions**: roadmap
  social y decisiones v1.
- **ref_brand_identity**: brand v2 Especiería (Azafrán + Cormorant + DM Sans).
- **feedback_no_free_text_entities**: regla de Google Places para entidades.

## Plans — qué hay

Plans relevantes a este proyecto, ordenados por hito:

- `como-podemos-crear-un-reflective-snail.md` — split de entornos dev/prod.
- `glowing-tinkering-sutton.md` — flujo de creación de categorías.
- `me-gustaria-crear-la-kind-donut.md` — página estrella restaurante v2.
- `necesitamos-enriquecer-la-pagina-iridescent-leaf.md` — página estrella dish v2.
- `necesito-que-revises-todo-deep-quail.md` — rediseño bold del frontend (brand v2 + Krug).
- `staged-wishing-sunset.md` — sección de valoración del establecimiento.
- `vamos-a-revisar-como-foamy-rain.md` — diagnóstico de deploy Vercel.
- `wild-hopping-stonebraker.md` — chatbot RAG.

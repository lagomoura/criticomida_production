# CritiComida — Pendientes (v1)

**Fecha:** 2026-04-24
**Fuente:** auditoría contra `docs/brand-identity.md`, `docs/brand-identity-v2.md`, `docs/design-system-v1.md`, `docs/criticomida-social-product-spec-v1.md`, memoria del proyecto y estado actual del código/backend.
**Alcance:** qué está implementado vs. qué falta para cumplir los objetivos levantados en los documentos de identidad y producto.

---

## Contexto del proyecto (ancla)

CritiComida es una red social editorial centrada en **platos** (no restaurantes). El principio no-negociable es *plato > restaurante*. Estamos en plena migración del modelo "guía editorial" al modelo "feed + conversación" (spec social v1). La identidad visual v2 (Especiería + Cormorant Garamond + DM Sans) ya está aplicada en código.

---

## Estado de implementación — lo que YA está hecho

### Identidad visual y design system
- `brand-identity-v2.md` reconciliado con `globals.css` (paleta Especiería, Cormorant + DM Sans cargadas vía `next/font`).
- Tokens semánticos expuestos como variables CSS y utilidades Tailwind (`--text-*`, `--surface-*`, `--action-*`, `--state-*-on`, `--focus-ring`).
- Modo oscuro vía clase `.dark` + anti-flicker script.
- `prefers-reduced-motion` respetado en `globals.css:1824`.

### Primitives (UI kit) — `app/components/ui/`
Button, IconButton, Avatar, Badge, Chip, Input, Textarea, Select, Tabs, Skeleton, EmptyState.

### Compuestos sociales — `app/components/social/`
PostHeader, DishDecisionBlock, PostBody, PostMedia, PostActions, PostCard, PostExtras, CommentItem, CommentComposer, NotificationItem, ProfileHeader, FollowButton, ReportModal, RestaurantAutocomplete, DishAutocomplete.

### Rutas / IA (navegación principal)
`/` (Feed), `/reviews/[id]`, `/dishes/[id]`, `/u/[userId]`, `/search`, `/compose`, `/notifications`, `/saved`, `/trending`, `/admin/reports`, `/about`, `/profile`. `Navbar` legacy eliminado; `TopNav` (md+) + `BottomNav` (mobile) orquestados por `NavShell`.

### Backend real (13 migraciones, mock flag = false)
Routers en `backend/app/routers/`: feed, posts, likes, follows, comments, bookmarks, notifications, reports, search, trending, users. Suite de 59 tests de integración en `backend/tests/integration/`.

### Fuentes canónicas (regla registrada)
Restaurants/dishes/ciudad **siempre** vienen de Google Places — compose ya usa autocomplete de Places + autocomplete de dishes del restaurant elegido.

---

## Pendientes organizados por categoría

### 🔴 Bloqueantes para usuarios reales

#### PEND-1. Hardening de producción del backend ✅ (2026-04-24)
- ✅ `backend/Dockerfile`: `CMD` cambiado a `uvicorn ... --workers 2` (sin `--reload`). Verificado con `docker build` + `docker inspect`.
- ✅ `backend/.env` y `backend/.env.example`: `CORS_ORIGINS` incluye `https://criticomida-production.vercel.app`.
- ✅ Fixture `_truncate_pytest_data` (session-scoped, autouse) en `backend/tests/integration/conftest.py`. Borra al final de la corrida: restaurants con `google_place_id LIKE 'pytest_place_%'` o creados por users pytest, y después los users pytest. Verificado limpiando 421 users + 170 restaurants acumulados; admin y 92 restaurants reales intactos. 59 tests siguen pasando.

#### PEND-2. Rate limiting & anti-spam (spec §16)
- No hay rate limiting por IP ni por usuario en el backend para acciones sociales (likes/follows/comments). Crítico antes de abrir a usuarios reales.
- Protección anti-spam de comentarios (señales + bloqueo) — sin empezar.

#### PEND-3. Moderación avanzada (spec §9.2)
- No existe edición de comentario en ventana corta (5-15 min) — decisión abierta: ¿edición o "no edit v1"?
- "Shadow-ban" / estado `removed` — el backend ya usa soft-delete de comentarios (`removed_at`), pero no hay shadow-ban de usuarios.
- Admin UI de `/admin/reports` ya existe; falta un panel para ver histórico de sanciones por usuario.

---

### 🟡 Calidad de producto / spec v1 sin cerrar

#### PEND-4. Reputación de usuarios (spec §10.2, DS v1)
- No se muestra badge/nivel en perfil público (`ProfileHeader`).
- No hay señales de "reseña útil" (voto útil) implementadas.
- Decidir si va en v1 o se pospone explícitamente.

#### PEND-5. Compartir (share) (spec §5.1)
- `PostActions` tiene botón share, pero verificar que genere link público copy-to-clipboard o use Web Share API nativa.
- Falta definir Open Graph / Twitter Card para `/reviews/[id]` (meta tags sociales para que el link compartido se vea bien).

#### PEND-6. Instrumentación de analítica (DS v1 §8)
- 0% implementada. No se dispara ni un evento (`feed_post_impression`, `post_like_toggle`, `profile_follow_toggle`, etc.).
- Bloquea medir DAU/WAU, retención D7/D30, interacciones por reseña, follows/usuarios activos, tiempo a primer valor (métricas de spec §3).
- Decisión previa: vendor-agnostic. Hay que elegir destino (PostHog / Plausible / GA4 + backend event log).

#### PEND-7. Accesibilidad — pasada completa (spec §16, DS v1 §5)
- `ReducedMotion` global ya está, pero falta auditoría por componente (hover transforms).
- Tab-order en feed, `aria-label` en IconButtons, foco visible: requiere pase con herramienta (axe / Lighthouse).
- Contrast check final con WCAG AA.

#### PEND-8. Tests de frontend
- 0 tests de frontend (solo pytest backend). Para un producto social con optimistic UI y rollback, conviene por lo menos tests de hooks (`usePostsInteraction`, `useFollowToggle`, `NotificationContext`).

---

### 🟢 Evolución funcional (Fase 2 y 3 del spec)

#### PEND-9. Fase 2 — "social más útil" (spec §15)
- ✅ Trending por ciudad (PR 14).
- ⏳ **Colecciones de guardados** (spec §5.1 v2) — actualmente `/saved` es lista plana, sin agrupar en colecciones temáticas.
- ⏳ **Mejoras de reputación** (ver PEND-4).
- ⏳ **Moderación avanzada** (ver PEND-3).

#### PEND-10. Fase 3 — "comunidad" (spec §15)
- Listas colaborativas de platos.
- Eventos / challenges editoriales (sin premio).
- DMs 1:1 (spec dice "si hay demanda real").

#### PEND-11. Feed "Para ti" — ranking más sofisticado (spec §7.2)
- Actual: heurística priority (PR 9 — `rating>=4`, likes, comments, recency, diversidad por restaurante).
- Falta: proximidad geográfica por ciudad del viewer, categorías preferidas del usuario (signal implícito: ¿qué reviews vio/likeó?), anti-repetición de autor (no solo restaurante).

---

### 🔵 Producto / UX (afinado visual y de copy)

#### PEND-12. Empty states y copy editorial (DS v1 §6, brand-identity §13)
- Revisar que los empty states respetan la voz "directo, sin celebraciones" (spec sugiere textos exactos en v2 §6.8.9).
- Feed "Siguiendo" vacío, comentarios vacíos, notificaciones vacías, búsqueda sin resultados, `/saved` vacío.

#### PEND-13. "Prompt de especificidad" en compose (spec §8.2)
- Actualmente `ComposeClient` tiene campos pros/cons/tags/portion, pero no hay prompts guiados ("Hablá del plato: textura, punto, porción, precio").
- Longitud mínima sugerida (sin hard-block) — verificar si aplica.

#### PEND-14. Paginación por cursor en todas las listas (spec §16)
- Feed ✅ (infinite scroll — PR 6).
- Comentarios ✅.
- Notificaciones — verificar.
- Lista de followers/following — verificar.
- Search — actualmente límite fijo 20/tab sin paginación.

#### PEND-15. Perfil público — tab "Guardados" (DS v1 §3.7)
- Actualmente `/u/[userId]` muestra solo reseñas. Falta tab de guardados públicos (o decisión explícita: "guardados son privados en v1").

---

### ⚪ Deuda técnica / housekeeping

#### PEND-16. Memoria desactualizada
- `project_open_issues.md` menciona paleta rosa `#ef7998` y Source Sans 3 — es info v1 obsoleta. Ya hay warning en la propia memory. Conviene reconciliarla para que no confunda en próximas sesiones.

#### PEND-17. Backfill de ciudades
- 85 restaurants antiguos no tienen `city` populada (PR 14 solo popula "going forward"). Si se quiere que Trending funcione retroactivamente, correr backfill con Places.

#### PEND-18. `.gitignore` / `skills-lock.json` sucios
- `git status` muestra `.gitignore` modificado, `skills-lock.json`, `.playwright-mcp/`. Limpiar antes del próximo PR.

#### PEND-19. Notificaciones fuera de in-app (spec §5.2)
- Email/push están explícitamente fuera de v1. Listar como "Fase 2+" para que no se olvide cuando haya demanda.

---

## Sugerencia de priorización

| Orden | Bloque | Justificación |
|---|---|---|
| 1 | PEND-1, PEND-2, PEND-3 | Prod-ready real — no abrir a usuarios sin esto |
| 2 | PEND-6, PEND-7 | Sin analítica no sabés si el producto funciona; a11y es requisito de spec §16 |
| 3 | PEND-12, PEND-13, PEND-14 | Pulido que cierra v1 del spec |
| 4 | PEND-4, PEND-5, PEND-15 | Completa lo que el spec dice "v1" pero está a medias |
| 5 | PEND-9 → PEND-10 → PEND-11 | Fase 2 y 3 — no bloquean lanzamiento |
| 6 | PEND-16 → PEND-18 | Housekeeping cuando haya ventana |

---

*Documento generado como snapshot del estado al 2026-04-24. A medida que se cierren PEND-*, marcar como ✅ o mover a un `pendings/done/` para mantener el historial.*

# CritiComida — Evolución a red social (Product Spec v1)

**Estado:** borrador para implementación  
**Objetivo:** convertir CritiComida en un producto social centrado en *platos* (no
restaurantes), habilitando interacción entre usuarios alrededor de reseñas,
descubrimiento y conversación.

---

## 1. Contexto y principio rector

CritiComida hoy es una plataforma de reseñas. La evolución propuesta es: **una
red social donde el contenido principal es la reseña de un plato**, y la unidad
social es la conversación que se forma alrededor de ese plato (y sus variantes).

**Principio rector (no negociable):** *plato > restaurante*.  
La capa social amplifica ese diferenciador; no lo diluye.

---

## 2. Visión del producto (qué cambia)

### Antes (modelo “guía”)
- Búsqueda → ficha → reseñas.
- Interacción mínima: leer y publicar.

### Después (modelo “feed + conversación”)
- **Feed** como entrada principal.
- **Perfiles** con identidad y reputación.
- **Interacciones** (likes, comentarios, guardados, follows).
- **Distribución** (descubrimiento por afinidad, ciudad, categorías, tendencias).
- **Confianza** (moderación, anti-spam, señales de calidad).

---

## 3. Objetivos, no-objetivos y criterios de éxito

### Objetivos
- Aumentar la **recurrencia** (volver a ver qué hay nuevo).
- Aumentar la **densidad social** (comentarios por reseña, follows).
- Mantener claridad del core: **qué pedir**.

### No-objetivos (v1)
- Mensajería 1:1 (DMs).
- “Stories” o video-first.
- Marketplace / reservas / delivery.

### Métricas (definición operativa)
- **DAU/WAU** y **retención** \(D7 / D30\).
- **Interacciones por reseña**: likes + comentarios + guardados.
- **Tasa de follow**: follows / usuarios activos.
- **Tiempo a primer valor**: desde landing a primera interacción (like, guardar,
  comentar o publicar reseña).
- **Contenido de calidad**: porcentaje de reseñas con texto \(\>= N chars\),
  fotos, y “útil” (señal interna o votos).

---

## 4. Personas y Jobs To Be Done (JTBD)

### 4.1 Explorador/a (descubre qué pedir)
- Quiere una decisión rápida: “¿qué plato vale la pena acá?”
- Necesita confianza: señales de calidad y consenso.

### 4.2 Reseñador/a (publica y construye reputación)
- Quiere expresar criterio y recibir feedback.
- Quiere ser reconocido/a por consistencia y especificidad.

### 4.3 Local (ciudad/barrio)
- Sigue tendencias y recomendaciones de su zona.
- Quiere ver “lo nuevo” y lo mejor de la semana.

---

## 5. Modelo social (interacciones)

### 5.1 Acciones
- **Like** en reseña.
- **Comentar** en reseña (thread simple, 1 nivel).
- **Guardar** plato o reseña (colecciones v2, no v1).
- **Seguir** usuarios.
- **Compartir** (link público).
- **Reportar** (moderación).

### 5.2 Notificaciones (MVP)
- “X le dio like a tu reseña”
- “X comentó tu reseña”
- “X empezó a seguirte”

**Canal v1:** in-app (campana). Email/push quedan fuera de v1.

---

## 6. Superficies y navegación (IA)

### 6.1 Navegación principal (propuesta)
- **Inicio (Feed)**
- **Buscar**
- **Crear** (reseña)
- **Notificaciones**
- **Perfil**

### 6.2 Pantallas v1 (lista mínima)
- Feed principal (para ti / siguiendo)
- Detalle de reseña (con comentarios)
- Detalle de plato (agregación social + reseñas)
- Perfil público de usuario
- Crear reseña (plato + restaurante + score + texto + fotos)
- Notificaciones
- Búsqueda (platos, restaurantes, usuarios)

---

## 7. Feed (distribución de contenido)

### 7.1 Tipos de items v1
- Reseña de plato (post principal).
- “Plato tendencia” (card agregada que linkea a detalle de plato).

### 7.2 Ordenamiento (simple, implementable)
**Feed “Siguiendo”:** reseñas recientes de usuarios seguidos.  
**Feed “Para ti”:** mezcla de:
- reseñas recientes + score alto + alta interacción,
- proximidad geográfica (si hay ciudad/barrio),
- categorías preferidas (si existen),
- diversidad (no repetir mismo restaurante seguido).

**Nota:** no hace falta un sistema ML para v1. Un ranking heurístico y filtros
alcanzan.

---

## 8. Contenido: formato de una reseña (post)

### 8.1 Campos mínimos
- Plato (nombre normalizado + alias si aplica).
- Restaurante.
- Score \(1–10\).
- Texto.
- Fotos (0..N).
- Precio (opcional v1).
- Fecha de consumo (opcional v1).

### 8.2 Señales de calidad (sin fricción)
- Longitud mínima sugerida (no hard-block).
- Prompt de especificidad: “Hablá del plato: textura, punto, porción, precio”.
- Etiquetas opcionales (p.ej. “picante”, “vegetariano”, “sin TACC”) si existen.

---

## 9. Conversación: comentarios

### 9.1 Reglas v1
- Thread de 1 nivel (comentarios directos a la reseña).
- Edición dentro de una ventana corta (p.ej. 5–15 min) o sin edición v1.
- Borrado por autor/a.

### 9.2 Moderación y anti-abuso (v1)
- Reportar comentario/reseña.
- Rate limits (crear comentarios / likes / follows).
- Shadow-ban o “soft delete” (si el backend ya lo soporta; si no, estado
  `removed`).

---

## 10. Perfiles y reputación

### 10.1 Perfil público
- Avatar.
- Display name.
- Bio corta.
- Ciudad (opcional).
- Conteos: reseñas, seguidores, seguidos.
- Grid/listado de reseñas.
- Platos guardados (v1 opcional; si no, solo reseñas).

### 10.2 Reputación (v1, simple)
Señales posibles:
- “Reseñas útiles” (si existe voto útil).
- Consistencia (cantidad de reseñas con texto + foto).
- Antigüedad.

En v1 puede mostrarse como “nivel” o badge, pero sin gamificación agresiva.

---

## 11. Privacidad y visibilidad

### v1 (recomendación)
- Todo el contenido es público.
- Perfil público.
- Opción “publicar como anónimo” **solo si ya existe el concepto** (de lo
  contrario, posponer).

---

## 12. Entidades y relaciones (modelo de datos)

### 12.1 Nuevas entidades (candidatas)
- `UserProfile` (si no existe)
- `Follow` (user_id → target_user_id)
- `Like` (user_id → review_id)
- `Comment` (user_id → review_id)
- `Notification` (recipient_user_id, type, actor_user_id, entity refs)
- `Bookmark` (user_id → dish_id o review_id)
- `Report` (reporter_user_id, entity_type, entity_id, reason)

### 12.2 Índices típicos
- `Follow(follower_id, following_id)` unique.
- `Like(user_id, review_id)` unique.
- `Comment(review_id, created_at)` para paginación.
- `Notification(recipient_user_id, created_at, read_at)` para inbox.

---

## 13. API (contratos de alto nivel)

### 13.1 Feed
- `GET /feed?type=for_you|following&cursor=...`

### 13.2 Interacciones
- `POST /reviews/{id}/like` / `DELETE /reviews/{id}/like`
- `POST /reviews/{id}/comments`
- `GET /reviews/{id}/comments?cursor=...`
- `POST /users/{id}/follow` / `DELETE /users/{id}/follow`

### 13.3 Notificaciones
- `GET /notifications?cursor=...`
- `POST /notifications/{id}/read`

---

## 14. UX: principios para “sentirse red social” sin perder foco

- **Entrada por feed**, pero con contexto de decisión (“qué pedir”) siempre
  visible: plato + restaurante + score.
- **Acción rápida**: like/guardar sin fricción; comentar sin abandonar pantalla.
- **Ritmo editorial**: evitar UI ruidosa; respetar la dirección visual definida
  en `docs/brand-identity-v2.md` (incluye “Social UI Kit v1”).
- **Confianza**: mostrar conteos, autor, y señales de calidad; permitir reportes.

---

## 15. Alcance por fases (recomendación)

### Fase 1 (MVP social)
- Feed (siguiendo + para ti simple).
- Perfil público.
- Likes y follows.
- Comentarios (1 nivel).
- Notificaciones in-app.

### Fase 2 (social “más útil”)
- Guardados + colecciones.
- Tendencias por ciudad.
- Mejoras de reputación.
- Moderación avanzada.

### Fase 3 (comunidad)
- Listas colaborativas.
- Eventos / challenges (sin premio, enfoque editorial).
- DMs (si hay demanda real).

---

## 16. Requerimientos no funcionales

- **Paginación por cursor** en feed, comentarios y notificaciones.
- **Rate limiting** por IP y por usuario.
- **Protección anti-spam** (señales + bloqueo).
- **Accesibilidad**: contraste, foco, `prefers-reduced-motion`.

---

## 17. Definición de “terminado” (DoD) para v1

- Feed estable con paginación, sin duplicados.
- Interacciones idempotentes (like/follow no duplican).
- Notificaciones coherentes (sin spam de self-actions).
- Moderación mínima operativa (report + ocultar/removed).
- Copy consistente con `docs/brand-identity.md §13`.


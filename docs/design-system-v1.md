# CritiComida — Design System (v1)

**Estado:** listo para implementación  
**Fuente de verdad visual:** `docs/brand-identity-v2.md` (incluye “Social UI Kit”)  
**Voz y tono:** `docs/brand-identity.md`  
**Producto social:** `docs/criticomida-social-product-spec-v1.md`

---

## 0. Principios

- **Plato > restaurante**: la jerarquía visual siempre prioriza el plato.
- **Editorial, no ruidoso**: densidad social sin “UI de casino”.
- **Estados consistentes**: hover/pressed/selected/loading/disabled idénticos en
  toda la app.
- **Accesible por defecto**: foco visible, targets 44×44, contraste con `--neutral-*`.

---

## 1. Tokens (semánticos)

> Los nombres de tokens son semánticos. Los valores crudos viven en `app/globals.css` y se listan en `brand-identity-v2.md §11`.

### 1.1 Color

- **Texto**
  - `text.primary`: `--neutral-900` (Carbón)
  - `text.secondary`: `--neutral-700`
  - `text.muted`: `--neutral-600` (Carbón suave)
  - `text.disabled`: `--neutral-500`
- **Superficies**
  - `surface.page`: `--color-crema`
  - `surface.card`: `--color-white`
  - `surface.subtle`: `--color-crema-dark`
- **Bordes**
  - `border.default`: `--color-crema-darker`
  - `border.subtle`: `--color-crema-dark`
- **Acción**
  - `action.primary`: `--color-azafran` (CTAs, links)
  - `action.secondary`: `--color-albahaca` (confirmaciones, follow activo)
  - `action.highlight`: `--color-azafran-light` (ratings, guardar, unread)
  - `action.danger`: `--color-paprika` (errores, report, delete)
- **Estados sociales**
  - `state.like.on`: `--color-paprika`
  - `state.save.on`: `--color-azafran`
  - `state.follow.on`: `--color-albahaca`

### 1.2 Tipografía

- **Display (títulos)**: Cormorant Garamond (300/400/500, con itálica)
- **UI/Body**: DM Sans (300/400/500)

Ambas se cargan vía `next/font/google` en `app/layout.tsx` y se exponen como `var(--font-display)` y `var(--font-sans)`.

**Escala recomendada (social):**
- `type.title.dish`: Cormorant 500, 20–24px
- `type.meta`: DM Sans 400, 13px
- `type.body`: DM Sans 400, 16–17px, line-height 1.6
- `type.label`: DM Sans 500, 14–16px

### 1.3 Radii

- `radius.sm`: 8px
- `radius.md`: 12px
- `radius.lg`: 16px
- `radius.pill`: 9999px

### 1.4 Espaciado

- `space.2`: 8px
- `space.3`: 12px
- `space.4`: 16px
- `space.5`: 20px
- `space.6`: 24px

### 1.5 Elevación (sombras)

Usar la escala de `brand-identity-v2.md` §7.

---

## 2. Estados y comportamiento (global)

### 2.1 Estados interactivos

- **Default**: ícono/label en `text.secondary`.
- **Hover**: `surface.subtle` + texto/ícono `text.primary`.
- **Pressed**: opacidad 0.85.
- **Selected**: color semántico (like/save/follow) aplicado a ícono/superficie.
- **Loading**: spinner inline (no bloquear layout).
- **Disabled**: `text.disabled` + `surface.subtle`.

### 2.2 Focus

- Ring visible: `0 0 0 3px rgba(200,57,26,0.15)` (v2 §6.6).
- No ocultar focus en mouse; reducirlo si hace falta, pero siempre visible.

### 2.3 Targets

- Mínimo 44×44 en icon buttons, tabs y acciones sociales.

---

## 3. Componentes (UI)

> Cada componente se define con: propósito, anatomía, variantes, props
> (conceptuales) y estados.

### 3.1 `Button`

**Propósito:** CTAs y acciones.

**Variantes:**
- `primary` (Azafrán)
- `secondary` (Albahaca)
- `outline` (Carbón)
- `ghost` (solo texto)

**Tamaños:** `sm` / `md` / `lg`  
**Estados:** hover/pressed/loading/disabled.

**Reglas:**
- Un CTA primario por pantalla/sección.
- Texto siempre legible (evitar body-text blanco sobre fondos no aptos).

### 3.2 `IconButton`

**Propósito:** acciones sociales y utilitarias (like, guardar, compartir).

**Props:**
- `icon`
- `label` (solo para a11y si es icon-only)
- `selected`
- `count?`
- `intent`: `like | save | follow | neutral`

**Layout:**
- Hit area 44×44.
- Si hay `count`, ubicar a la derecha (no debajo) en feed para compactar.

### 3.3 `PostCard` (feed item)

**Propósito:** unidad principal de contenido social.

**Anatomía:**
- `PostHeader`
- `DishDecisionBlock`
- `PostBody`
- `PostMedia`
- `PostActions`

**Layout (v1):**
- `radius.lg` (16px), padding 16–20px, borde `border.default`.
- Texto clamp 4 (mobile) / 5–6 (desktop) + “Ver más”.

**Estados:**
- `loading`: skeleton.
- `removed`: placeholder + razón genérica (moderación) si aplica.

### 3.4 `DishDecisionBlock`

**Propósito:** mantener foco “qué pedir”.

**Contenido mínimo:**
- Plato (título display)
- Restaurante (meta)
- Score (Cormorant 500) + estrellas en `action.highlight`

**Regla:** siempre visible en PostCard y en detalle de reseña.

### 3.5 `CommentItem` + `CommentComposer`

**Propósito:** conversación bajo reseña.

**Anatomía:**
- Avatar 28–32
- Nombre + timestamp (inline)
- Texto
- (Opcional) acciones: report, delete (según permisos)

**Composer:**
- Input multiline, botón enviar.
- Loading y error inline.

### 3.6 `NotificationItem`

**Propósito:** inbox social.

**Anatomía:**
- Ícono por tipo (like/comment/follow)
- Texto principal (1 línea)
- Meta (timestamp)

**Estados:**
- `unread`: `surface.subtle` + borde izquierdo `action.highlight` (2–3px).

### 3.7 `ProfileHeader` + `FollowButton`

**Propósito:** identidad y conexión.

**ProfileHeader:**
- Avatar 72–96
- Nombre (Cormorant 500) + bio (UI)
- Contadores (followers/following/reviews)

**FollowButton:**
- Estados: follow / following / loading / disabled.
- `following`: usar `action.secondary` o `outline` (no competir con CTA primario).

### 3.8 `Tabs`

**Propósito:** navegación local (perfil: reseñas/guardados).

**Reglas:**
- Target 44×44.
- `active` con underline `action.primary` (2px).

### 3.9 `Input`, `Textarea`, `Select`

Usar reglas de v2 §6.6 (borde, focus ring, radio 8px).

### 3.10 `Badge` / `Chip`

**Propósito:** categorías, etiquetas, metadatos.

**Variantes:**
- `neutral` (surface.subtle)
- `brand` (solo para íconos/superficies, no para texto pequeño)

---

## 4. Patrones (UX)

### 4.1 Feed

- Paginación por cursor.
- Infinite scroll con sentinel; botón “Cargar más” solo como fallback.
- Mantener variedad (no repetir mismo restaurante consecutivamente si se puede).

### 4.2 Loading / Empty / Error

- **Loading:** skeletons, no spinners de página completa.
- **Empty:** copy directo (sin celebraciones).
- **Error:** mensaje + acción “Intentar de nuevo”.

---

## 5. Accesibilidad (checklist v1)

- Foco visible en todos los interactivos.
- Navegación por teclado en feed (tab order lógico).
- `aria-label` obligatorio en `IconButton` sin texto.
- Contraste: texto y meta usando `--neutral-*` (ver v2 §12).
- Respeto de `prefers-reduced-motion`.

---

## 6. Copy (aplicación)

Para estados vacíos, errores, confirmaciones y prompts de escritura, seguir los
principios de `brand-identity.md` (Directo, específico, cercano, sin
condescendencia).

---

## 7. Contratos de componentes (para implementación)

Los contratos están expresados como “props conceptuales” (independientes del
framework). En React/Next.js se traducen a props + callbacks.

### 7.1 Convenciones globales

- **`id`**: string estable (para testing/telemetría).
- **`className`**: opcional (si el proyecto usa Tailwind, se compone por fuera).
- **Eventos**: usar nombres `onX`.
- **Accesibilidad**:
  - Icon-only => requiere `ariaLabel`.
  - Si un componente es clickable, soporta navegación por teclado.
- **Optimistic UI**: permitido en acciones sociales (like/save/follow).

### 7.2 `Button` contract

**Props**
- `variant`: `primary | secondary | outline | ghost`
- `size`: `sm | md | lg`
- `disabled?`: boolean
- `loading?`: boolean
- `leftIcon?`, `rightIcon?`
- `onClick?`
- `type?`: `button | submit`

**Behavior**
- `loading` deshabilita clicks y mantiene ancho (no reflow).
- `disabled` mantiene focus ring cuando corresponde (no “romper” tab order).

**A11y**
- Si solo ícono (sin texto), usar `IconButton` en lugar de `Button`.

### 7.3 `IconButton` contract

**Props**
- `intent`: `like | save | follow | neutral`
- `selected?`: boolean
- `disabled?`: boolean
- `loading?`: boolean
- `icon`
- `count?`: number
- `ariaLabel`: string (obligatorio si no hay texto visible)
- `onClick?`

**Behavior**
- Hit area 44×44 siempre.
- `count` es informativo; no cambia el target del ícono.

**A11y**
- `aria-pressed` cuando `selected` aplique (like/save).

### 7.4 `PostCard` contract

**Props (datos)**
- `postId`: string
- `author`: `{ userId, displayName, avatarUrl?, handle? }`
- `createdAt`: ISO string
- `dish`: `{ dishId?, name, restaurantName, score, category? }`
- `text`: string
- `media?`: `{ images: Array<{ url, alt? }> }`
- `stats`: `{ likes, comments, saves }`
- `viewerState`: `{ liked, saved, followingAuthor? }`
- `status?`: `active | removed`

**Props (callbacks)**
- `onOpenPost(postId)`
- `onOpenDish(dishId?)`
- `onOpenAuthor(userId)`
- `onToggleLike(postId, nextLiked)`
- `onToggleSave(postId, nextSaved)`
- `onComment(postId)`
- `onShare(postId)`
- `onFollowAuthor?(userId, nextFollowing)`
- `onReport?(postId)`

**Behavior**
- En feed, el card entero puede abrir el detalle; las acciones deben detener
  propagación para no “abrir por accidente”.
- Clamp de texto en feed; en detalle se muestra completo.
- Si `status=removed`, ocultar media y texto; mostrar placeholder consistente.

**A11y**
- El card debe ser navegable por teclado si es interactivo (role/link).
- Las acciones deben tener labels claros.

### 7.5 `DishDecisionBlock` contract

**Props**
- `dishName`: string
- `restaurantName`: string
- `score`: number (1–10)
- `category?`: string
- `onOpenDish?`
- `onOpenRestaurant?`

**Behavior**
- Score siempre visible.
- Categoría opcional como `Badge`.

### 7.6 `CommentItem` contract

**Props**
- `commentId`: string
- `author`: `{ userId, displayName, avatarUrl? }`
- `createdAt`: ISO string
- `text`: string
- `viewerPermissions?`: `{ canDelete, canReport }`
- `onOpenAuthor(userId)`
- `onDelete?(commentId)`
- `onReport?(commentId)`

**Behavior**
- Texto sin truncar en detalle; truncar solo si la lista es muy densa (opt).

### 7.7 `CommentComposer` contract

**Props**
- `postId`: string
- `value`: string
- `maxLength?`: number
- `disabled?`: boolean
- `loading?`: boolean
- `error?`: string
- `onChange(nextValue)`
- `onSubmit()`

**Behavior**
- `onSubmit` bloquea doble envío mientras `loading=true`.
- Error se muestra inline (no modal).

### 7.8 `NotificationItem` contract

**Props**
- `notificationId`: string
- `type`: `like | comment | follow`
- `unread`: boolean
- `createdAt`: ISO string
- `actor`: `{ userId, displayName, avatarUrl? }`
- `target?`: `{ postId?, dishId?, userId? }`
- `text`: string (mensaje ya resuelto por backend o formateador)
- `onOpenTarget(notificationId)`
- `onMarkRead?(notificationId)`

**Behavior**
- Click abre el target y marca como leído (optimistic si aplica).

### 7.9 `ProfileHeader` contract

**Props**
- `userId`: string
- `displayName`: string
- `avatarUrl?`: string
- `bio?`: string
- `location?`: string
- `counts`: `{ followers, following, reviews }`
- `viewerState`: `{ isSelf, following }`
- `onFollowToggle?(userId, nextFollowing)`
- `onEditProfile?()` (solo self)

**Behavior**
- Si `isSelf`, reemplazar follow por “Editar perfil”.

### 7.10 `Tabs` contract

**Props**
- `value`: string
- `items`: Array<{ value, label, count? }>
- `onChange(nextValue)`
- `ariaLabel`: string

**Behavior**
- Navegable con teclado (izq/der) si se implementa como tabs.

### 7.11 `Input` / `Textarea` / `Select` contract

**Props comunes**
- `name`
- `label?`
- `value`
- `placeholder?`
- `disabled?`
- `error?`: string
- `helpText?`: string
- `onChange`

**A11y**
- `label` asociado (id/for) o `aria-label`.
- `error` expuesto con `aria-describedby`.

---

## 8. Eventos de analítica (v1)

Objetivo: instrumentar métricas del spec social sin acoplarse a un vendor.

### 8.1 Convenciones

- **Naming**: `snake_case`, prefijo por superficie.
  - Ejemplo: `feed_post_impression`, `post_like_toggle`.
- **Contexto obligatorio** en todos los eventos:
  - `timestamp`
  - `session_id`
  - `viewer_user_id` (si existe login; si no, `null`)
  - `screen`: `feed | post_detail | dish_detail | profile | search | notifications`
- **Sin PII**: no enviar texto libre (reseña/comentario), email, teléfono.
- **IDs estables**: `post_id`, `dish_id`, `restaurant_id`, `author_user_id`.
- **List context** cuando aplique:
  - `feed_type`: `for_you | following`
  - `position`: índice 0-based del item dentro de la lista renderizada
  - `cursor`: cursor actual (si existe)

### 8.2 Payload estándar (recomendado)

- `screen`
- `source`: `feed | profile | search | notifications | deep_link`
- `entity_type`: `post | dish | user | comment`
- `entity_id`
- `author_user_id?`
- `feed_type?`
- `position?`
- `query?` (solo si es string normalizado y no PII; si no, enviar `query_length`)
- `latency_ms?`
- `error_code?` (si falla)

### 8.3 Eventos por superficie

#### Feed

- `feed_view`
  - Cuando se muestra el feed (`feed_type`).
- `feed_post_impression`
  - Cuando un post entra en viewport (dedupe por `post_id` por sesión).
- `feed_post_open`
  - Click/tap para abrir detalle (incluye `post_id`, `position`).
- `feed_load_more`
  - Cuando se solicita la próxima página (cursor).

#### Post detail

- `post_view`
  - Vista del detalle de post.
- `post_like_toggle`
  - Payload: `post_id`, `next_state` boolean, `method`: `tap | keyboard`.
- `post_save_toggle`
  - Payload: `post_id`, `next_state`.
- `post_share_click`
  - Payload: `post_id`, `share_target?`: `copy_link | native`.
- `post_comment_create`
  - Payload: `post_id`, `comment_length`, `has_mention?` boolean.
- `post_report_submit`
  - Payload: `post_id`, `reason`.

#### Dish detail

- `dish_view`
  - Payload: `dish_id`, `restaurant_id?`.
- `dish_review_create_start`
  - Cuando el usuario entra al flujo de crear reseña desde un plato.
- `dish_review_create_submit`
  - Payload: `dish_id`, `score`, `text_length`, `images_count`.

#### Profile

- `profile_view`
  - Payload: `profile_user_id`, `is_self`.
- `profile_follow_toggle`
  - Payload: `profile_user_id`, `next_state`.
- `profile_tab_change`
  - Payload: `tab`: `reviews | saved`.

#### Search

- `search_view`
- `search_submit`
  - Payload: `query_length`, `filters?`, `result_count?`.
- `search_result_open`
  - Payload: `entity_type`, `entity_id`, `position`.

#### Notifications

- `notifications_view`
- `notification_open`
  - Payload: `notification_id`, `type`, `target_entity_type`, `target_entity_id`.
- `notifications_mark_all_read`

### 8.4 Reglas de calidad (anti-ruido)

- No disparar `*_impression` más de 1 vez por entidad por sesión.
- Los toggles (like/save/follow) deben registrar:
  - `attempt` (usuario clickeó) y, si hay backend, `success/failure` opcional.
- En errores, enviar `error_code` estable (no mensajes largos).



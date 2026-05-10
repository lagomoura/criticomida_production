# Palato — Identidad Visual v2.1

> Documento de rediseño. Define la dirección visual del sitio.  
> Reemplaza los criterios estéticos de `brand-identity.md` — los datos de arquitectura y voz siguen vigentes.
>
> **Estado (2026-05):** paleta *Terracota & Dorado* y tipografías *Cormorant Garamond* + *Inter* ya están aplicadas en `app/globals.css` y `app/[locale]/layout.tsx`. Este documento describe lo que existe en código, no una aspiración futura.
>
> **Cambios desde v2 (Especiería → Terracota & Dorado):** Azafrán → Terracota; Páprika → Terracota deep (rol de error); Albahaca → Dorado (rol de éxito y "premium"); Carbón → Espresso. Crema mantiene el nombre, valores recalibrados. UI font: DM Sans → Inter Variable. Cormorant Garamond no cambia.

---

## 0. Fuente de verdad (para construir producto)

Este documento (`brand-identity-v2.md`) es la **fuente única de verdad** para:

- **Tokens visuales**: color, tipografía, escala, elevación, border-radius.
- **Componentes UI**: botones, inputs, cards, navbar, listas.
- **Estados**: hover, pressed, selected, disabled, loading, error/success.

En caso de conflicto con otros documentos visuales (por ejemplo,
`criticomida-identidad-visual.md`), **manda v2**.

Los lineamientos de **voz y tono** siguen en `brand-identity.md` (sección “Tono
de Voz”).

---

## 1. Concepto Central

### "La mesa del crítico"

Palato reseña platos, no restaurantes. Esa diferencia es el punto de partida del diseño: la entidad protagonista es el plato — su color, su textura, su temperatura visual. La identidad no imita a una app de delivery ni a una guía gastronómica tradicional. Se posiciona como **una publicación editorial de cocina**: opinada, específica, confiable.

**Metáfora de diseño:** una mesa de trabajo bien organizada. Espacio limpio, tipografía clara, fotografía como protagonista, color como acento. Como el mise en place antes del servicio: todo tiene su lugar y su propósito.

### Tres palabras que guían cada decisión visual

| Palabra | Qué significa en diseño |
|---|---|
| **Honesto** | Sin decoración vacía. Cada elemento cumple una función. |
| **Apetitoso** | Los colores generan hambre visual. Las fotos son el héroe. |
| **Preciso** | Jerarquía clara. Tipografía calibrada. Sin ruido. |

---

## 2. Paleta de Colores — "Terracota & Dorado"

La paleta abandona el origen "especiero argentino" de v2 y se reorienta a una sensibilidad editorial mediterránea/europea: terracota como color de marca, dorado como acento premium, espresso como tinta principal sobre crema cálida. Los valores listados aquí son los que viven en `app/globals.css`.

### 2.1 Colores de Marca

| Nombre | Variable | Hex | Uso |
|---|---|---|---|
| **Terracota** | `--color-terracota` | `#C96A4B` | Color de marca. CTAs, links, logo, acento primario. |
| **Terracota claro** | `--color-terracota-light` | `#E07A5F` | Hover de primary. |
| **Terracota pálido** | `--color-terracota-pale` | `#FBEDE7` | Tags, chips, fondos sutiles. |
| **Terracota profundo** | `--color-terracota-deep` | `#A8472D` | Estados negativos, error, danger, report, "like" activo. |
| **Dorado** | `--color-dorado` | `#D6A75C` | Premium, ratings ≥9, éxito, confirmaciones, "follow" / "save" activo. |
| **Dorado claro** | `--color-dorado-light` | `#E8BE7A` | Hover sobre dorado. |
| **Dorado pálido** | `--color-dorado-pale` | `#FAF1DD` | Fondos positivos / éxito. |
| **Espresso** | `--color-espresso` | `#2A211C` | Texto principal, fondos oscuros. |
| **Espresso medio** | `--color-espresso-mid` | `#524339` | Texto UI / secundario fuerte. |
| **Espresso suave** | `--color-espresso-soft` | `#7A6A5D` | Metadata, texto muted. |
| **Crema** | `--color-crema` | `#F7F1E8` | Fondo principal de página. Nunca blanco puro. |
| **Crema oscuro** | `--color-crema-dark` | `#EFE4D2` | Fondo secundario, superficies de tarjeta sutiles. |
| **Crema más oscuro** | `--color-crema-darker` | `#DCCDB4` | Bordes, divisores. |
| **Blanco** | `--color-white` | `#FFFFFF` | Superficies de card, inputs. |

### 2.2 Escala de Neutros

La escala de neutros es cálida — todos tienen una temperatura ligeramente marrón/beige, nunca gris frío. Se exponen como `--neutral-*` y se alinean con los tokens `--color-*` de arriba.

| Token | Hex | Uso |
|---|---|---|
| `--neutral-100` | `#FFFFFF` (`--color-white`) | Superficies: tarjetas, inputs. |
| `--neutral-200` | `#F7F1E8` (`--color-crema`) | Fondo de página. |
| `--neutral-300` | `#EFE4D2` (`--color-crema-dark`) | Bordes sutiles, fondos alternos. |
| `--neutral-400` | `#DCCDB4` (`--color-crema-darker`) | Bordes default. |
| `--neutral-500` | `#B8A892` | Placeholder text, disabled. |
| `--neutral-600` | `#7A6A5D` (`--color-espresso-soft`) | Texto secundario / meta. |
| `--neutral-700` | `#524339` | Texto de soporte. |
| `--neutral-800` | `#524339` (`--color-espresso-mid`) | Texto UI. |
| `--neutral-900` | `#2A211C` (`--color-espresso`) | Texto principal. |

### 2.3 Estados Semánticos

Los estados se derivan directamente de la paleta. **Importante:** la paleta nueva no incluye verde ni rojo "tradicionales" — error y éxito se construyen con variantes de la familia terracota/dorado. Esto rompe la convención clásica rojo=error / verde=éxito; mitigar siempre con icono explícito y/o copy claro.

| Estado | Texto | Fondo | Borde |
|---|---|---|---|
| Éxito | `--color-dorado` | `--color-dorado-pale` | `--color-dorado-light` |
| Error | `--color-terracota-deep` | `--color-terracota-pale` | `--color-terracota-light` |
| Advertencia | `--color-terracota-deep` | `--color-dorado-pale` | `--color-dorado-light` |
| Info | `--color-espresso-mid` | `--color-crema-dark` | `--color-crema-darker` |

### 2.4 Gradientes

| Nombre | Definición | Uso |
|---|---|---|
| **Marca principal** | `linear-gradient(135deg, var(--color-terracota), var(--color-terracota-light))` | CTAs hero, wordmark en contextos especiales. |
| **Marca cálida** | `linear-gradient(135deg, var(--color-terracota), var(--color-dorado))` | Banners editoriales, highlights premium de sección. |
| **Tierra** | `linear-gradient(180deg, var(--color-crema), var(--color-crema-dark))` | Fondos de página con profundidad sutil. |
| **Nocturno** | `linear-gradient(180deg, var(--color-espresso), var(--color-espresso-mid))` | Footer, overlays sobre fotos en hero. |

---

## 3. Tipografía

### 3.1 Sistema tipográfico

Dos familias. Una sola fuente por propósito — sin mezclas innecesarias. Ambas se cargan vía `next/font/google` en `app/[locale]/layout.tsx`.

| Rol | Familia | Variable CSS | Fallback |
|---|---|---|---|
| **Display / Títulos / Logo** | **Cormorant Garamond** | `var(--font-display)` (`--font-cormorant`) | `Georgia, serif` |
| **UI / Texto corrido** | **Inter** (Variable) | `var(--font-sans)` (`--font-inter`) | `ui-sans-serif, system-ui` |

**Por qué Cormorant Garamond para display:** serif editorial de contraste alto y cierre elegante. Da carácter "publicación" a los nombres de platos y titulares sin caer en lo formal o anticuado. Contrasta limpiamente con la sans de UI.

**Por qué Inter para UI:** sans neutral diseñada específicamente para pantallas, legible a cuerpos chicos, cobertura amplia (Variable Font, todos los pesos 100–900 en un solo asset). Es la sans de facto del producto SaaS moderno (Linear, Vercel, GitHub) — comunica "herramienta digital" sin carácter forzado.

### 3.2 Escala tipográfica (recomendada)

| Elemento | Familia | Tamaño | Peso | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Hero title | Cormorant | `clamp(2.5rem, 7vw, 5.5rem)` | 500 | 1.1 | -0.02em |
| H1 página | Cormorant | `clamp(2rem, 5vw, 3.5rem)` | 500 | 1.15 | -0.01em |
| H2 sección | Cormorant | `clamp(1.5rem, 3vw, 2.25rem)` | 500 | 1.2 | 0 |
| H3 card | Cormorant | `1.25rem` | 500 | 1.3 | 0 |
| Body base | Inter | `1rem` (16px) | 400 | 1.6 | 0 |
| Body lead | Inter | `1.125rem` | 400 | 1.55 | 0 |
| UI label | Inter | `0.875rem` | 500 | 1.4 | 0.02em uppercase |
| Caption / meta | Inter | `0.8125rem` | 400 | 1.45 | 0 |
| Navbar link | Inter | `0.9375rem` | 500 | 1 | 0 |
| Rating number | Cormorant | `2rem` | 500 | 1 | -0.02em |

### 3.3 Pesos cargados

**Cormorant Garamond:** 300, 400, 500 — normal e itálica. (Definido en `app/[locale]/layout.tsx`.)  
**Inter:** Variable Font — el rango completo 100–900 viene en un solo asset, no hay que declarar pesos individuales. (Definido en `app/[locale]/layout.tsx`.)

Para el OG card (Satori, en `app/api/og/review/[id]/route.tsx`) Inter se carga como TTF estático en dos pesos (400, 500) desde `public/fonts/Inter-{Regular,Medium}.ttf`, porque Satori no soporta variable fonts.

### 3.4 Uso de itálica

La itálica de Cormorant Garamond se reserva para:
- Nombres de platos en reviews: *"El ramen de pollo estaba perfecto."*
- Taglines y claims de marca.
- No para énfasis funcional — usar peso 500 para eso.

---

## 4. Logo y Wordmark

### 4.1 Wordmark principal

```
Palato
```

- Tipografía: **Cormorant Garamond 500**
- Color por defecto: `var(--color-espresso)` sobre fondos claros
- Color sobre fondos oscuros: `var(--color-crema)`
- Color de marca (navbar, footer brand): gradiente `var(--color-terracota) → var(--color-dorado)` aplicado como `background-clip: text`
- Nunca en minúsculas. Siempre "Palato" con capital P.

### 4.2 Combinación con ícono

El mascot character (badge circular existente) se mantiene en uso. Para el rediseño se recomienda usarlo como:
- Ícono de app / favicon exclusivamente
- Combinado con el wordmark en Cormorant para la navbar

No cambiar los colores internos del SVG del mascot en esta versión.

### 4.3 Tratamiento del wordmark en display

En contextos display (banner hero, splash screens), se puede romper el wordmark en dos pesos para énfasis editorial:

```
Pa           ← Cormorant 300 (light), color Espresso suave
lato         ← Cormorant 500, color Terracota o Espresso
```

---

## 5. Espaciado y Layout

### 5.1 Contenedor principal

Sin cambios respecto al sistema actual:
```css
.cc-container {
  max-width: 72rem;   /* 1152px */
  margin: 0 auto;
  padding: 0 1.25rem;
}
```

### 5.2 Sección de espaciado vertical

| Nivel | Valor | Uso |
|---|---|---|
| XS | `0.5rem` | Espacio interno entre elementos de un componente |
| S | `1rem` | Gap entre cards en grids compactos |
| M | `1.5rem` | Gap estándar de grids |
| L | `3rem` | Padding interno de secciones |
| XL | `5rem` | Separación entre secciones en desktop |
| 2XL | `8rem` | Espaciado hero / secciones de alto impacto |

### 5.3 Border-radius

| Nivel | Valor | Uso |
|---|---|---|
| XS | `4px` | Badges muy compactos, tags inline |
| S | `8px` | Botones pequeños, inputs, alerts |
| M | `12px` | Botones estándar, cards compactas |
| L | `16px` | Cards de contenido principal |
| XL | `24px` | Cards hero, paneles de detalle |
| 2XL | `2rem` | Footer (esquinas superiores), modales |
| Full | `9999px` | Píldoras: ratings, categorías, location badges |

### 5.4 Breakpoints

Idénticos al sistema actual. Ver `brand-identity.md §5`.

---

## 6. Componentes — Dirección Visual

### 6.1 Navbar

```
Fondo: rgba(247, 241, 232, 0.82)   ← Crema translúcida
Backdrop-filter: blur(12px)
Border-bottom: 1px solid #DCCDB4   ← crema-darker
Box-shadow: 0 4px 24px rgba(42,33,28,0.08)
Border-radius: 1rem
```

Flotante con `mx-3 mt-3`. El wordmark usa el gradiente Terracota → Dorado.

### 6.2 Hero / Banner

La foto ocupa el ancho completo. Overlay con el gradiente Nocturno en la parte inferior (`linear-gradient(to top, rgba(42,33,28,0.72) 0%, transparent 55%)`). El título en Cormorant 500 blanco sobre el overlay.

Sin fondos de color sólido en el hero — la fotografía es el fundamento visual.

### 6.3 Cards de Restaurante

```
Fondo: #FFFFFF (blanco puro — contrasta con el fondo Crema de la página)
Border: 1px solid #DCCDB4
Border-radius: 16px
Shadow reposo: 0 2px 8px rgba(42,33,28,0.06)
Shadow hover: 0 8px 28px rgba(42,33,28,0.12)
Hover: translateY(-3px)
```

**Imagen:** ratio `4/3`, `overflow: hidden`. En hover: `scale(1.04)`, filtro `brightness(0.92) contrast(1.05)`.

**Badge de categoría** (sobre imagen, arriba izquierda):
- Fondo: `rgba(247, 241, 232, 0.92)`
- Texto: `#C96A4B` (Terracota), peso 600, 12px
- Border-radius: `9999px`

**Badge de conteo** (sobre imagen, arriba derecha):
- Fondo: `rgba(42, 33, 28, 0.72)`
- Texto: blanco, peso 600, 12px

### 6.4 Rating / Estrellas

Color de estrellas: `#D6A75C` (Dorado — refuerza el rol "premium" del rating alto)  
El número de rating usa **Cormorant 500** — diferencia visual inmediata del texto UI.

### 6.5 Botones

| Variante | Fondo | Texto | Hover |
|---|---|---|---|
| Primary | `#C96A4B` (Terracota) | `#FFFFFF` | `#E07A5F` (Terracota claro) + `translateY(-2px)` |
| Secondary | `#D6A75C` (Dorado) | `#2A211C` (Espresso) | `#E8BE7A` (Dorado claro) + `translateY(-2px)` |
| Ghost | Transparente | `#C96A4B` (Terracota) | Borde+bg `#C96A4B`, texto blanco |
| Outline | Transparente | `#2A211C` (Espresso) | Borde+bg Espresso, texto Crema |
| Danger | `#A8472D` (Terracota deep) | `#FFFFFF` | Terracota + icono explícito |
| Hero CTA | Gradiente Marca principal | `#FFFFFF` | Gradiente invertido + `scale(1.06)` |

Propiedades base:
```css
border-radius: 8px;
font-weight: 600;
font-family: Inter;
font-size: 0.9375rem;
padding: 0.625rem 1.25rem;
transition: all 0.2s ease;
```

### 6.6 Formularios

```
Border reposo: 1.5px solid #DCCDB4   (Crema más oscuro)
Border focus: 1.5px solid #C96A4B    (Terracota)
Ring focus: 0 0 0 3px rgba(201,106,75,0.35)   (Terracota 35%)
Border-radius: 8px
Background: #FFFFFF
```

### 6.7 Footer

```
Background: #2A211C   (Espresso)
Border-top: 3px solid #D6A75C   (Dorado — línea cálida de separación)
Border-radius: 2rem 2rem 0 0
```

Texto secundario en footer: `#7A6A5D` (Espresso suave).  
Brand wordmark en footer: gradiente `#C96A4B → #D6A75C`, Cormorant 500, 2.2rem.

---

## 6.8 Social UI Kit (v1)

Esta sección define los componentes mínimos para que Palato "se sienta" una
red social sin perder foco editorial. Se apoya en:

- Tipografía: **Cormorant** (display) + **Inter** (UI).
- Colores: `--color-*` y `--neutral-*` (ver §2).
- Radios: escala de §5.3.
- Sombras: escala de §7.

### 6.8.1 Post card (item del feed)

**Estructura:**
- Header: avatar (32–40px), display name, handle opcional, timestamp.
- Bloque “decisión”: plato (título) + restaurante (meta) + score.
- Cuerpo: texto (máx. 4–6 líneas en feed, expandible).
- Media: 0..N fotos (1 foto hero o grid 2×).
- Footer: barra de acciones + conteos.

**Jerarquía tipográfica:**
- Plato: Cormorant 500.
- Restaurante + timestamp + conteos: Inter, `--neutral-700`/`--neutral-600`.
- Score: Cormorant 500 (como en §6.4).

**Contención visual para scroll largo:**
- Fondo: `#FFFFFF` sobre página `--color-crema`.
- Borde: `1px solid --neutral-400`.
- Radio: `16px` (cards principales).
- Padding interno: `16px–20px`.

### 6.8.2 Barra de acciones (like / comentar / guardar / compartir)

**Reglas de UX:**
- Acciones siempre visibles en feed.
- Área clickeable mínima 44×44.
- Feedback inmediato (optimistic UI) para like/guardar.

**Estados:**
- Default: ícono `--neutral-700`.
- Hover: ícono `--neutral-900` + fondo sutil `--neutral-300`.
- Pressed: reduce opacidad 0.85.
- Selected (liked/saved): ícono `--color-terracota` (like) o `--color-terracota-light`
  (guardar), sin usar color para texto pequeño.
- Loading: spinner pequeño en `--neutral-700`.
- Disabled: `--neutral-500`.

### 6.8.3 Comentarios (thread 1 nivel)

**Item de comentario:**
- Avatar 28–32px.
- Nombre + timestamp inline.
- Texto (Inter, 16–17px).

**Comportamiento:**
- “Ver más” para threads largos.
- Input fijo al final del detalle de reseña (no en feed).

### 6.8.4 Notificaciones (lista)

**Item:**
- Ícono por tipo (like/comment/follow) + texto + timestamp.
- Estado no leído: fondo `--neutral-300` + borde izquierdo `--color-terracota-light` (2–3px).

**Reglas:**
- Las notificaciones deben ser “escaneables”: 1 línea principal + meta.

### 6.8.5 Perfil público

**Header:**
- Avatar 72–96px.
- Nombre (Cormorant 500) + bio (Inter).
- Botón follow con estados (default/hover/disabled).

**Tabs (v1):**
- Reseñas
- Guardados (si se implementa v1)

### 6.8.6 Estados de sistema (listas largas)

**Loading:**
- Skeletons para post card (header + 3 líneas + media).

**Empty:**
- Copy directo y específico (ver `brand-identity.md`), sin celebraciones.

**Error:**
- Alert con `--state-error-*` (ver §2.4). Acción: “Intentar de nuevo”.

### 6.8.7 Tokens de interacción (v1)

Para evitar inconsistencias en una UI social (muchos estados repetidos), se
definen tokens semánticos. Implementación: variables CSS o alias Tailwind.

**Acción / énfasis:**
- Primary action: `--color-terracota`
- Positive highlight (rating): `--color-terracota-light`
- Secondary action: `--color-dorado`

**Contenido / meta:**
- Texto principal: `--neutral-900`
- Texto secundario: `--neutral-700`
- Timestamps y conteos: `--neutral-600`
- Bordes: `--neutral-400`
- Superficie sutil: `--neutral-300`

**Estados de controles:**
- Hover bg (chips, action buttons): `--neutral-300`
- Focus ring: `rgba(200, 57, 26, 0.15)` (mismo que §6.6)
- Disabled fg: `--neutral-500`
- Disabled bg: `--neutral-300`

**Acciones sociales (color de estado selected):**
- Like selected: `--color-terracota`
- Save selected: `--color-terracota-light`
- Follow selected: `--color-dorado`

Regla: el color de acción se aplica a **íconos y superficies**, no a texto
pequeño de body.

### 6.8.8 Medidas y densidad (listas)

Definiciones para que el feed sea escaneable y consistente.

**Grilla y espaciado:**
- Gap entre cards: `16px` (mobile) / `20px` (desktop)
- Padding de pantalla: usar el contenedor de §5.1
- Dividers internos: `1px solid --neutral-400`

**Post card (feed):**
- Radio: `16px`
- Padding: `16px` (mobile), `20px` (≥768px)
- Header gap: `12px`
- Avatar: `36px` default, `40px` si hay espacio
- Max width del bloque texto: sin forzar; permitir lectura natural

**Tipografía recomendada para scroll largo:**
- Display name: Inter 600, 16px
- Timestamp: Inter 400, 13px, color `--neutral-600`
- Plato: Cormorant 500, 20–24px (según breakpoint)
- Restaurante: Inter 400, 14–15px, color `--neutral-700`
- Texto reseña (preview): Inter 400, 16–17px, line-height 1.6

**Clamp de texto en feed:**
- Mobile: 4 líneas.
- Desktop: 5–6 líneas.
- “Ver más” inline, estilo link (color `--color-terracota`).

### 6.8.9 Patrones de listas (feed / comentarios / notificaciones)

**Paginación:**
- Siempre por cursor.
- “Cargar más” solo como fallback; preferir infinite scroll con sentinel.

**Loading:**
- Feed: skeleton de 1 card completo.
- Comentarios: skeleton de 3 items compactos.
- Notificaciones: skeleton de 5 items.

**Empty (copy sugerido, tono v1):**
- Feed siguiendo: “Todavía no seguís a nadie. Seguí a alguien para ver sus
  reseñas acá.”
- Comentarios: “Todavía no hay comentarios. ¿Qué te pareció este plato?”
- Notificaciones: “No tenés notificaciones por ahora.”

**Error (copy sugerido):**
- “No pudimos cargar esto. Intentá de nuevo.”

### 6.8.10 Accesibilidad (mínimos)

- Touch targets: 44×44 mínimo en acciones y tabs.
- Estados de foco visibles (ring).
- `prefers-reduced-motion`: sin transforms en hover, mantener cambios de color.
- Contraste: usar `--neutral-*` para texto de body y meta (ver §12).

---

## 7. Elevación y Sombras

Todas las sombras usan el tono Espresso (`42, 33, 28`) en lugar de negro puro — las sombras cálidas se integran mejor con la paleta:

| Nivel | CSS | Contexto |
|---|---|---|
| Micro | `0 1px 3px rgba(42,33,28,0.08)` | Badges, chips |
| Base | `0 2px 8px rgba(42,33,28,0.06)` | Cards en reposo |
| Media | `0 4px 16px rgba(42,33,28,0.10)` | Cards interactivas, dropdowns |
| Elevada | `0 8px 28px rgba(42,33,28,0.12)` | Cards en hover, modales |
| Flotante | `0 12px 40px rgba(42,33,28,0.18)` | Navbar, toasts, tooltips |
| Botón | `0 4px 12px rgba(201,106,75,0.25)` | `.btn-primary` hover (Terracota tinted) |

En dark mode las sombras pasan a `rgba(0, 0, 0, 0.4–0.6)` — más profundas y sin tinte cálido (un tinte espresso sobre fondo café no se percibe).

---

## 8. Animaciones

### Easing de marca

```css
cubic-bezier(0.34, 1.56, 0.64, 1)
```

Overshoot suave — como el rebote de una cucharada cayendo. Más fluido que el easing anterior. Se usa en entradas de elementos de marca y hover states expresivos.

Para transiciones funcionales de UI (inputs, dropdowns, estados): `cubic-bezier(0.4, 0, 0.2, 1)` (ease estándar de Material/Tailwind).

### Patrones de hover

| Elemento | Transformación |
|---|---|
| Logo navbar | `scale(1.06)` |
| Nav links | `color: Terracota` + underline `scaleX(0→1)` en `2px solid Terracota` |
| Gallery cards | `translateY(-3px)` |
| Imágenes | `scale(1.04)` |
| Botones | `translateY(-2px)` |
| Hero CTA | `scale(1.06) translateY(-2px)` |
| Footer links | `color: Crema` desde Espresso suave |

### Duraciones

| Tipo | Duración |
|---|---|
| Micro (hover, color) | `150ms` |
| Standard (transform, shadow) | `250ms` |
| Entrada de sección | `600ms – 900ms` |
| Hero / splash | `1000ms – 1200ms` |

### `prefers-reduced-motion`

Todas las animaciones y transforms de hover se desactivan. El color de hover sigue activo (no es movimiento).

---

## 9. Fotografía

### Estilo

- **Planos preferidos:** overhead (cenital) para platos, 45° para texturas y composiciones.
- **Temperatura de color:** cálida. 5000–5500K. Sin dominantes azules o verdosas.
- **Ratio de crop para cards:** `4:3`. Para hero: `16:9` o `3:1` panorámico.
- **Edición:** contraste moderado (+10), saturación natural (no saturada en exceso), sin filtros de Instagram.
- **Fondo del plato:** superficies neutras: madera clara, mármol blanco, lino, cerámica. Nunca manteles con patrones fuertes.

### Directiva de color en fotografía

Las fotos deben tener al menos un elemento que ancle con la paleta: la calidez de la luz, el marrón de un pan, el dorado de una salsa, el verde de hierbas frescas. La fotografía y la paleta deben sentirse del mismo mundo.

---

## 10. Iconografía

Continúa FontAwesome v6 (ya instalado). No agregar nuevas librerías.

Color de íconos funcionales: `#524339` (`--neutral-700` / Espresso medio)  
Color de íconos de acento/marca: `#C96A4B` (Terracota)  
Color de íconos premium / éxito: `#D6A75C` (Dorado)  
Color de íconos sobre fondos oscuros: `#DCCDB4` (Crema más oscuro)

---

## 11. Variables CSS — Referencia Completa

Estas variables viven en `app/globals.css`. Esta sección es un espejo — ante cualquier discrepancia, **manda `globals.css`**.

```css
:root {
  /* === PALETA TERRACOTA & DORADO === */
  --color-terracota:       #C96A4B;   /* marca, CTAs, links, logo */
  --color-terracota-light: #E07A5F;   /* hover de primary */
  --color-terracota-pale:  #FBEDE7;   /* tags, fondos sutiles */
  --color-terracota-deep:  #A8472D;   /* error, danger, "like" activo */
  --color-dorado:          #D6A75C;   /* premium, ratings ≥9, éxito, save, follow */
  --color-dorado-light:    #E8BE7A;   /* hover sobre dorado */
  --color-dorado-pale:     #FAF1DD;   /* fondos positivos */
  --color-espresso:        #2A211C;   /* texto principal, fondos oscuros */
  --color-espresso-mid:    #524339;   /* texto UI / secundario */
  --color-espresso-soft:   #7A6A5D;   /* metadata, muted */
  --color-crema:           #F7F1E8;   /* fondo principal */
  --color-crema-dark:      #EFE4D2;   /* fondo secundario, superficies */
  --color-crema-darker:    #DCCDB4;   /* bordes, divisores */
  --color-white:           #FFFFFF;   /* cards, inputs */

  /* === NEUTROS CÁLIDOS (derivados) === */
  --neutral-100: var(--color-white);
  --neutral-200: var(--color-crema);
  --neutral-300: var(--color-crema-dark);
  --neutral-400: var(--color-crema-darker);
  --neutral-500: #B8A892;
  --neutral-600: var(--color-espresso-soft);
  --neutral-700: #524339;
  --neutral-800: var(--color-espresso-mid);
  --neutral-900: var(--color-espresso);

  /* === TIPOGRAFÍA (definidas en layout.tsx via next/font) === */
  --font-sans:    var(--font-inter), 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
}
```

### 11.1 Tokens semánticos

Sobre los tokens crudos de arriba se expone una capa de tokens semánticos para que los componentes no referencien colores de marca directamente. Los componentes consumen `--text-primary`, `--surface-page`, `--action-primary`, etc.

```css
:root {
  --text-primary:        var(--neutral-900);
  --text-secondary:      var(--neutral-700);
  --text-muted:          var(--neutral-600);
  --text-disabled:       var(--neutral-500);
  --text-inverse:        var(--color-white);

  --surface-page:        var(--color-crema);
  --surface-card:        var(--color-white);
  --surface-subtle:      var(--color-crema-dark);

  --border-subtle:       var(--color-crema-dark);
  --border-default:      var(--color-crema-darker);
  --border-strong:       var(--neutral-500);

  --action-primary:       var(--color-terracota);
  --action-primary-hover: var(--color-terracota-light);
  --action-secondary:     var(--color-dorado);
  --action-highlight:     var(--color-dorado);
  --action-danger:        var(--color-terracota-deep);

  --state-like-on:   var(--color-terracota-deep);
  --state-save-on:   var(--color-dorado);
  --state-follow-on: var(--color-dorado);

  --focus-ring: 0 0 0 3px color-mix(in srgb, var(--color-terracota) 35%, transparent);
}
```

El bloque `.dark { ... }` en `globals.css` reasigna las variables crudas; los tokens semánticos heredan automáticamente la resolución.

---

## 12. Contraste y Accesibilidad

Pares verificados (mentalmente — confirmar con contrast checker antes de cada deploy importante):

### Light mode
| Par | Ratio aprox. | WCAG AA | Uso |
|---|---|---|---|
| `#2A211C` (Espresso) sobre `#F7F1E8` (Crema) | ~14:1 | **AAA** | Texto principal |
| `#524339` sobre `#F7F1E8` | ~9.3:1 | **AAA** | Texto secundario |
| `#7A6A5D` (Espresso suave) sobre `#F7F1E8` | ~5.0:1 | **AA** | Texto muted / meta |
| `#FFFFFF` sobre `#C96A4B` (Terracota) | ~3.6:1 | **AA grandes** | Texto en botón primary (≥18px) |
| `#FFFFFF` sobre `#A8472D` (Terracota deep) | ~5.4:1 | **AA** | Texto en botón danger |
| `#2A211C` sobre `#D6A75C` (Dorado) | ~7.6:1 | **AAA** | Texto en botón secundario |
| `#C96A4B` (Terracota) sobre `#F7F1E8` | ~4.5:1 | **AA** | Links, iconos de acento |
| `#A8472D` (Terracota deep) sobre `#F7F1E8` | ~6.8:1 | **AA** | Estado de error en texto |

### Dark mode
| Par | Ratio aprox. | WCAG AA | Uso |
|---|---|---|---|
| `#F5EDE0` sobre `#1C140F` (page) | ~14:1 | **AAA** | Texto principal |
| `#B8A48F` (muted) sobre `#1C140F` | ~7.4:1 | **AAA** | Texto muted |
| `#E07A5F` (Terracota dark) sobre `#1C140F` | ~4.6:1 | **AA** | CTAs, links |
| `#C99A52` (Dorado dark) sobre `#1C140F` | ~4.5:1 | **AA** | Highlights premium |

**Regla práctica:** para texto de body y UI usar siempre la escala `--neutral-*`. Los colores de marca (`--color-*`) son para fondos, bordes, íconos y texto grande (≥18px regular / ≥14px bold). Para estados error/éxito, **siempre** acompañar de icono explícito — la paleta no usa la convención clásica rojo=error / verde=ok.

---

## 13. Modo Oscuro

El sistema soporta modo oscuro vía clase `.dark` en `<html>` (ver `app/[locale]/layout.tsx` + `globals.css`). En dark mode se reasignan las variables crudas, incluyendo los colores de marca (en v2 los chromáticos no se tocaban; en v2.1 se recalibran ligeramente para mantener contraste y legibilidad sobre fondos café oscuro):

```css
.dark {
  /* Neutros cálidos invertidos — café oscuro sin azules fríos */
  --neutral-100: #2A1F18;   /* cards, marrón profundo */
  --neutral-200: #1C140F;   /* fondo de página, café muy oscuro */
  --neutral-300: #3A2C22;   /* bordes sutiles, hover bg */
  --neutral-400: #4D3B2E;   /* bordes default */
  --neutral-500: #6B5645;   /* placeholder */
  --neutral-600: #B8A48F;   /* muted (~7.4:1 sobre page) */
  --neutral-700: #D6C5B0;   /* texto de soporte */
  --neutral-800: #E8DDC9;   /* texto UI */
  --neutral-900: #F5EDE0;   /* texto principal (~14:1 sobre page) */

  /* Marca recalibrada para dark — terracota más vibrante, dorado tenue */
  --color-terracota:       #E07A5F;          /* AA ~4.6:1 sobre page */
  --color-terracota-light: #F09277;
  --color-terracota-pale:  rgba(224, 122, 95, 0.14);
  --color-terracota-deep:  #C96A4B;          /* error legible */
  --color-dorado:          #C99A52;          /* tenue, AA ~4.5:1 */
  --color-dorado-light:    #D6A75C;
  --color-dorado-pale:     rgba(214, 167, 92, 0.14);

  /* Cremas y espressos reasignados */
  --color-crema:        var(--neutral-200);
  --color-crema-dark:   var(--neutral-300);
  --color-crema-darker: var(--neutral-400);
  --color-espresso:        var(--neutral-900);
  --color-espresso-mid:    var(--neutral-800);
  --color-espresso-soft:   var(--neutral-600);

  /* Sombras dark — más profundas, sin tinte cálido */
  --shadow-micro:    0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-base:     0 2px 8px rgba(0, 0, 0, 0.45);
  --shadow-media:    0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-elevated: 0 8px 28px rgba(0, 0, 0, 0.55);
  --shadow-floating: 0 12px 40px rgba(0, 0, 0, 0.6);
}
```

Los tokens semánticos (`--text-primary`, `--surface-page`, `--action-primary`, etc.) heredan automáticamente los nuevos valores — no requieren override en `.dark`.

---

## 14. Lo que Cambia entre Versiones

| Elemento | v1 (rosa) | v2 (Especiería) | v2.1 (Terracota & Dorado) |
|---|---|---|---|
| Color primario de marca / acción | `#ef7998` (rosa) | `#D4870A` (Azafrán) | `#C96A4B` (Terracota) |
| Color de estados negativos | `#FF6B6B` (coral) | `#C03B28` (Páprika) | `#A8472D` (Terracota deep) |
| Color secundario / confirmaciones | `#4ECDC4` (turquesa) | `#3A6645` (Albahaca) | `#D6A75C` (Dorado) |
| Color de "like" activo | `#FF6B6B` | `#C03B28` (Páprika) | `#A8472D` (Terracota deep) |
| Color de "save / follow / premium" | — | `#3A6645` (Albahaca) | `#D6A75C` (Dorado) |
| Fondo de página | `#FFFFFF` (blanco frío) | `#F8F4EE` (Crema) | `#F7F1E8` (Crema, recalibrado) |
| Texto principal | `#212529` | `#1A1714` (Carbón) | `#2A211C` (Espresso) |
| Tipografía display | Source Sans 3 | Cormorant Garamond | Cormorant Garamond (sin cambios) |
| Tipografía UI | Source Sans 3 | DM Sans | **Inter Variable** |
| Sombras | Tono negro puro | rgba(26,22,20,…) Carbón | rgba(42,33,28,…) Espresso |
| Gradiente principal | `#ef7998 → #F9E494` | `Azafrán → Azafrán claro` | `Terracota → Terracota claro` |
| Gradiente cálido | — | `Azafrán → Canela` | `Terracota → Dorado` (premium) |

---

## 15. Moodboard Verbal

Para comunicar la dirección a colaboradores, diseñadores o herramientas de IA:

> "Una revista de cocina minimalista, pero con carácter mediterráneo. Fondo crema cálido — no blanco, crema. Cormorant Garamond en los titulares, Inter limpia en el cuerpo. El color que manda es la **terracota** — un naranja-ladrillo profundo que se siente arcilla, no neón. El **dorado** aparece en los detalles premium: ratings altos, confirmaciones, "save", "follow" — comunica jerarquía sin gritar. El **espresso** es la tinta: oscuro, cálido, casi marrón, nunca negro. Para errores y "danger" usamos una variante más oscura del terracota — porque la paleta no admite rojo neón ni verde de éxito; el sistema se apoya en iconos y copy claro para diferenciar estados. Sin gradientes de neón, sin sombras azuladas, sin fuentes display de moda. Fotografía cálida, platos como protagonistas. La UI debe sentirse como una publicación editorial que vale la pena leer, no como una app de delivery."

---

*Versión 2.1 — Recoloreado. Reemplaza la paleta Especiería de v2 por Terracota & Dorado. Tipografía UI migra a Inter Variable. Cormorant Garamond, escalas, espaciado, radius, animación y arquitectura de tokens semánticos no cambian.*  
*Los principios de voz, arquitectura de información y jerarquía de entidades (plato > restaurante) siguen siendo los mismos — ver `brand-identity.md §13`.*

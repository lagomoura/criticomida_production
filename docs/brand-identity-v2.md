# CritiComida — Identidad Visual v2

> Documento de rediseño. Define la dirección visual del sitio.  
> Reemplaza los criterios estéticos de `brand-identity.md` — los datos de arquitectura y voz siguen vigentes.
>
> **Estado (2026-04):** paleta *Especiería* y tipografías *Cormorant Garamond* + *DM Sans* ya están aplicadas en `app/globals.css` y `app/layout.tsx`. Este documento describe lo que existe en código, no una aspiración futura.

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

CritiComida reseña platos, no restaurantes. Esa diferencia es el punto de partida del diseño: la entidad protagonista es el plato — su color, su textura, su temperatura visual. La identidad no imita a una app de delivery ni a una guía gastronómica tradicional. Se posiciona como **una publicación editorial de cocina**: opinada, específica, confiable.

**Metáfora de diseño:** una mesa de trabajo bien organizada. Espacio limpio, tipografía clara, fotografía como protagonista, color como acento. Como el mise en place antes del servicio: todo tiene su lugar y su propósito.

### Tres palabras que guían cada decisión visual

| Palabra | Qué significa en diseño |
|---|---|
| **Honesto** | Sin decoración vacía. Cada elemento cumple una función. |
| **Apetitoso** | Los colores generan hambre visual. Las fotos son el héroe. |
| **Preciso** | Jerarquía clara. Tipografía calibrada. Sin ruido. |

---

## 2. Paleta de Colores — "Especiería"

La paleta está inspirada en los colores de una alacena de especias y ingredientes frescos: tonos que existen en la naturaleza comestible, no en paletas digitales genéricas. Los valores listados aquí son los que viven en `app/globals.css`.

### 2.1 Colores de Marca

| Nombre | Variable | Hex | Uso |
|---|---|---|---|
| **Azafrán** | `--color-azafran` | `#D4870A` | Color de marca. CTAs, links, acento primario. |
| **Azafrán claro** | `--color-azafran-light` | `#F5C842` | Highlights, logo sobre fondos oscuros. |
| **Azafrán pálido** | `--color-azafran-pale` | `#FEF3D6` | Fondos informativos, tags, chips. |
| **Páprika** | `--color-paprika` | `#C03B28` | Estados negativos, errores, "like" activo. |
| **Páprika claro** | `--color-paprika-light` | `#E86149` | Hover sobre elementos páprika. |
| **Páprika pálido** | `--color-paprika-pale` | `#FDECEA` | Fondos de error. |
| **Albahaca** | `--color-albahaca` | `#3A6645` | Ratings altos (≥9), confirmaciones, "follow" activo. |
| **Albahaca claro** | `--color-albahaca-light` | `#5A9668` | Hover sobre albahaca. |
| **Albahaca pálido** | `--color-albahaca-pale` | `#EBF4ED` | Fondos positivos. |
| **Canela** | `--color-canela` | `#8B5E3C` | Acento cálido, categorías secundarias. |
| **Carbón** | `--color-carbon` | `#1A1714` | Texto principal, fondos oscuros. |
| **Carbón medio** | `--color-carbon-mid` | `#3D3830` | Texto secundario fuerte. |
| **Carbón suave** | `--color-carbon-soft` | `#6B6358` | Metadatos, texto muted. |
| **Crema** | `--color-crema` | `#F8F4EE` | Fondo principal de página. Nunca blanco puro. |
| **Crema oscuro** | `--color-crema-dark` | `#EDE7DC` | Superficies de tarjeta sutiles. |
| **Crema más oscuro** | `--color-crema-darker` | `#D9D1C4` | Bordes, divisores. |
| **Blanco** | `--color-white` | `#FFFFFF` | Superficies de card, inputs. |

### 2.2 Escala de Neutros

La escala de neutros es cálida — todos tienen una temperatura ligeramente marrón/beige, nunca gris frío. Se exponen como `--neutral-*` y se alinean con los tokens `--color-*` de arriba.

| Token | Hex | Uso |
|---|---|---|
| `--neutral-100` | `#FFFFFF` (`--color-white`) | Superficies: tarjetas, inputs. |
| `--neutral-200` | `#F8F4EE` (`--color-crema`) | Fondo de página. |
| `--neutral-300` | `#EDE7DC` (`--color-crema-dark`) | Bordes sutiles, fondos alternos. |
| `--neutral-400` | `#D9D1C4` (`--color-crema-darker`) | Bordes fuertes. |
| `--neutral-500` | `#B8AFA3` | Placeholder text. |
| `--neutral-600` | `#6B6358` (`--color-carbon-soft`) | Texto secundario / meta. |
| `--neutral-700` | `#3A3530` | Texto de soporte. |
| `--neutral-800` | `#3D3830` (`--color-carbon-mid`) | Texto de interfaz. |
| `--neutral-900` | `#1A1714` (`--color-carbon`) | Texto principal. |

### 2.3 Estados Semánticos

Los estados se derivan directamente de la paleta de marca. No introducir verdes, rojos o amarillos fuera de esta paleta.

| Estado | Texto | Fondo | Borde |
|---|---|---|---|
| Éxito | `--color-albahaca` | `--color-albahaca-pale` | `--color-albahaca-light` |
| Error | `--color-paprika` | `--color-paprika-pale` | `--color-paprika-light` |
| Advertencia | `--color-canela` | `--color-azafran-pale` | `--color-azafran-light` |
| Info | `--color-carbon-mid` | `--color-crema-dark` | `--color-crema-darker` |

### 2.4 Gradientes

| Nombre | Definición | Uso |
|---|---|---|
| **Marca principal** | `linear-gradient(135deg, var(--color-azafran), var(--color-azafran-light))` | CTAs hero, wordmark en contextos especiales. |
| **Marca cálida** | `linear-gradient(135deg, var(--color-azafran), var(--color-canela))` | Banners editoriales, highlights de sección. |
| **Tierra** | `linear-gradient(180deg, var(--color-crema), var(--color-crema-dark))` | Fondos de página con profundidad sutil. |
| **Nocturno** | `linear-gradient(180deg, var(--color-carbon), var(--color-carbon-mid))` | Footer, overlays sobre fotos en hero. |

---

## 3. Tipografía

### 3.1 Sistema tipográfico

Dos familias. Una sola fuente por propósito — sin mezclas innecesarias. Ambas se cargan vía `next/font/google` en `app/layout.tsx`.

| Rol | Familia | Variable CSS | Fallback |
|---|---|---|---|
| **Display / Títulos** | **Cormorant Garamond** | `var(--font-display)` (`--font-cormorant`) | `Georgia, serif` |
| **UI / Texto corrido** | **DM Sans** | `var(--font-sans)` (`--font-dm-sans`) | `ui-sans-serif, system-ui` |

**Por qué Cormorant Garamond para display:** serif editorial de contraste alto y cierre elegante. Da carácter "publicación" a los nombres de platos y titulares sin caer en lo formal o anticuado. Contrasta limpiamente con DM Sans.

**Por qué DM Sans para UI:** sans geométrica neutral, legible a cuerpos pequeños, cero ego. Buena para componentes densos (feed social, comentarios, metadatos).

### 3.2 Escala tipográfica (recomendada)

| Elemento | Familia | Tamaño | Peso | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Hero title | Cormorant | `clamp(2.5rem, 7vw, 5.5rem)` | 500 | 1.1 | -0.02em |
| H1 página | Cormorant | `clamp(2rem, 5vw, 3.5rem)` | 500 | 1.15 | -0.01em |
| H2 sección | Cormorant | `clamp(1.5rem, 3vw, 2.25rem)` | 500 | 1.2 | 0 |
| H3 card | Cormorant | `1.25rem` | 500 | 1.3 | 0 |
| Body base | DM Sans | `1rem` (16px) | 400 | 1.6 | 0 |
| Body lead | DM Sans | `1.125rem` | 400 | 1.55 | 0 |
| UI label | DM Sans | `0.875rem` | 500 | 1.4 | 0.02em uppercase |
| Caption / meta | DM Sans | `0.8125rem` | 400 | 1.45 | 0 |
| Navbar link | DM Sans | `0.9375rem` | 500 | 1 | 0 |
| Rating number | Cormorant | `2rem` | 500 | 1 | -0.02em |

### 3.3 Pesos cargados

**Cormorant Garamond:** 300, 400, 500 — normal e itálica. (Definido en `app/layout.tsx`.)  
**DM Sans:** 300, 400, 500. (Definido en `app/layout.tsx`.)

Si el diseño necesita pesos mayores (600/700), agregarlos explícitamente en `layout.tsx` antes de usarlos. No asumir disponibilidad.

### 3.4 Uso de itálica

La itálica de Cormorant Garamond se reserva para:
- Nombres de platos en reviews: *"El ramen de pollo estaba perfecto."*
- Taglines y claims de marca.
- No para énfasis funcional — usar peso 500 para eso.

---

## 4. Logo y Wordmark

### 4.1 Wordmark principal

```
CritiComida
```

- Tipografía: **Cormorant Garamond 500**
- Color por defecto: `var(--color-carbon)` sobre fondos claros
- Color sobre fondos oscuros: `var(--color-crema)`
- Color de marca (navbar, footer brand): gradiente `var(--color-azafran) → var(--color-azafran-light)` aplicado como `background-clip: text`
- Nunca en minúsculas. Siempre "CritiComida" con capital C y M.

### 4.2 Combinación con ícono

El mascot character (badge circular existente) se mantiene en uso. Para el rediseño se recomienda usarlo como:
- Ícono de app / favicon exclusivamente
- Combinado con el wordmark en Cormorant para la navbar

No cambiar los colores internos del SVG del mascot en esta versión.

### 4.3 Tratamiento de "Criti" vs "Comida"

En contextos display (banner hero, splash screens), se puede romper el wordmark en dos líneas o dos pesos para énfasis:

```
Criti        ← Cormorant 300 (light), color Carbón suave
Comida       ← Cormorant 500, color Azafrán o Carbón
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
Fondo: rgba(250, 246, 238, 0.82)   ← Crema translúcida
Backdrop-filter: blur(12px)
Border-bottom: 1px solid #D9D1C4   ← n-200
Box-shadow: 0 4px 24px rgba(26,22,20,0.08)
Border-radius: 1rem
```

Flotante con `mx-3 mt-3`. El wordmark usa el gradiente Azafrán → Azafrán.

### 6.2 Hero / Banner

La foto ocupa el ancho completo. Overlay con el gradiente Nocturno en la parte inferior (`linear-gradient(to top, rgba(26,22,20,0.72) 0%, transparent 55%)`). El título en Cormorant 500 blanco sobre el overlay.

Sin fondos de color sólido en el hero — la fotografía es el fundamento visual.

### 6.3 Cards de Restaurante

```
Fondo: #FFFFFF (blanco puro — contrasta con el fondo Crema de la página)
Border: 1px solid #D9D1C4
Border-radius: 16px
Shadow reposo: 0 2px 8px rgba(26,22,20,0.06)
Shadow hover: 0 8px 28px rgba(26,22,20,0.12)
Hover: translateY(-3px)
```

**Imagen:** ratio `4/3`, `overflow: hidden`. En hover: `scale(1.04)`, filtro `brightness(0.92) contrast(1.05)`.

**Badge de categoría** (sobre imagen, arriba izquierda):
- Fondo: `rgba(250, 246, 238, 0.92)`
- Texto: `#D4870A` (Azafrán), peso 600, 12px
- Border-radius: `9999px`

**Badge de conteo** (sobre imagen, arriba derecha):
- Fondo: `rgba(26, 22, 20, 0.72)`
- Texto: blanco, peso 600, 12px

### 6.4 Rating / Estrellas

Color de estrellas: `#F5C842` (Azafrán)  
El número de rating usa **Cormorant 500** — diferencia visual inmediata del texto UI.

### 6.5 Botones

| Variante | Fondo | Texto | Hover |
|---|---|---|---|
| Primary | `#D4870A` (Azafrán) | `#F8F4EE` (Crema) | `#A82E14` + `translateY(-2px)` |
| Secondary | `#3A6645` (Albahaca) | `#F8F4EE` | `#3D6047` + `translateY(-2px)` |
| Ghost | Transparente | `#D4870A` | Borde+bg `#D4870A`, texto Crema |
| Outline | Transparente | `#1A1714` | Borde+bg Carbón, texto Crema |
| Hero CTA | Gradiente Marca principal | `#F8F4EE` | Gradiente invertido + `scale(1.06)` |

Propiedades base:
```css
border-radius: 8px;
font-weight: 600;
font-family: DM Sans;
font-size: 0.9375rem;
padding: 0.625rem 1.25rem;
transition: all 0.2s ease;
```

### 6.6 Formularios

```
Border reposo: 1.5px solid #D9D1C4   (Crema más oscuro)
Border focus: 1.5px solid #D4870A    (Azafrán)
Ring focus: 0 0 0 3px rgba(200,57,26,0.15)
Border-radius: 8px
Background: #FFFFFF
```

### 6.7 Footer

```
Background: #1A1714   (Carbón)
Border-top: 3px solid #F5C842   (Azafrán — línea cálida de separación)
Border-radius: 2rem 2rem 0 0
```

Texto secundario en footer: `#6B6358` (Carbón suave).  
Brand wordmark en footer: gradiente `#D4870A → #F5C842`, Cormorant 500, 2.2rem.

---

## 6.8 Social UI Kit (v1)

Esta sección define los componentes mínimos para que CritiComida “se sienta” una
red social sin perder foco editorial. Se apoya en:

- Tipografía: **Cormorant** (display) + **DM Sans** (UI).
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
- Restaurante + timestamp + conteos: DM Sans, `--neutral-700`/`--neutral-600`.
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
- Selected (liked/saved): ícono `--color-azafran` (like) o `--color-azafran-light`
  (guardar), sin usar color para texto pequeño.
- Loading: spinner pequeño en `--neutral-700`.
- Disabled: `--neutral-500`.

### 6.8.3 Comentarios (thread 1 nivel)

**Item de comentario:**
- Avatar 28–32px.
- Nombre + timestamp inline.
- Texto (DM Sans, 16–17px).

**Comportamiento:**
- “Ver más” para threads largos.
- Input fijo al final del detalle de reseña (no en feed).

### 6.8.4 Notificaciones (lista)

**Item:**
- Ícono por tipo (like/comment/follow) + texto + timestamp.
- Estado no leído: fondo `--neutral-300` + borde izquierdo `--color-azafran-light` (2–3px).

**Reglas:**
- Las notificaciones deben ser “escaneables”: 1 línea principal + meta.

### 6.8.5 Perfil público

**Header:**
- Avatar 72–96px.
- Nombre (Cormorant 500) + bio (DM Sans).
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
- Primary action: `--color-azafran`
- Positive highlight (rating): `--color-azafran-light`
- Secondary action: `--color-albahaca`

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
- Like selected: `--color-azafran`
- Save selected: `--color-azafran-light`
- Follow selected: `--color-albahaca`

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
- Display name: DM Sans 600, 16px
- Timestamp: DM Sans 400, 13px, color `--neutral-600`
- Plato: Cormorant 500, 20–24px (según breakpoint)
- Restaurante: DM Sans 400, 14–15px, color `--neutral-700`
- Texto reseña (preview): DM Sans 400, 16–17px, line-height 1.6

**Clamp de texto en feed:**
- Mobile: 4 líneas.
- Desktop: 5–6 líneas.
- “Ver más” inline, estilo link (color `--color-azafran`).

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

Todas las sombras usan el tono Carbón (`26, 22, 20`) en lugar de negro puro — las sombras cálidas se integran mejor con la paleta:

| Nivel | CSS | Contexto |
|---|---|---|
| Micro | `0 1px 3px rgba(26,22,20,0.08)` | Badges, chips |
| Base | `0 2px 8px rgba(26,22,20,0.06)` | Cards en reposo |
| Media | `0 4px 16px rgba(26,22,20,0.10)` | Cards interactivas, dropdowns |
| Elevada | `0 8px 28px rgba(26,22,20,0.12)` | Cards en hover, modales |
| Flotante | `0 12px 40px rgba(26,22,20,0.18)` | Navbar, toasts, tooltips |
| Botón | `0 4px 12px rgba(200,57,26,0.25)` | `.btn-primary` hover |

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
| Nav links | `color: Azafrán` + underline `scaleX(0→1)` en `2px solid Azafrán` |
| Gallery cards | `translateY(-3px)` |
| Imágenes | `scale(1.04)` |
| Botones | `translateY(-2px)` |
| Hero CTA | `scale(1.06) translateY(-2px)` |
| Footer links | `color: Crema` desde Carbón suave |

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

Color de íconos funcionales: `#5C564F` (`--neutral-700`)  
Color de íconos de acento/marca: `#D4870A` (Azafrán)  
Color de íconos sobre fondos oscuros: `#D9D1C4` (Crema más oscuro)

---

## 11. Variables CSS — Referencia Completa

Estas variables viven en `app/globals.css`. Esta sección es un espejo — ante cualquier discrepancia, **manda `globals.css`**.

```css
:root {
  /* === PALETA ESPECIERÍA === */
  --color-azafran:        #D4870A;   /* marca, CTAs, links, acento */
  --color-azafran-light:  #F5C842;   /* highlights, logo sobre oscuro */
  --color-azafran-pale:   #FEF3D6;   /* fondos informativos, tags */
  --color-paprika:        #C03B28;   /* errores, estados negativos */
  --color-paprika-light:  #E86149;
  --color-paprika-pale:   #FDECEA;
  --color-albahaca:       #3A6645;   /* ratings ≥9, confirmaciones */
  --color-albahaca-light: #5A9668;
  --color-albahaca-pale:  #EBF4ED;
  --color-canela:         #8B5E3C;   /* acento cálido, categorías */
  --color-carbon:         #1A1714;   /* texto principal, fondos oscuros */
  --color-carbon-mid:     #3D3830;
  --color-carbon-soft:    #6B6358;
  --color-crema:          #F8F4EE;   /* fondo principal */
  --color-crema-dark:     #EDE7DC;
  --color-crema-darker:   #D9D1C4;
  --color-white:          #FFFFFF;

  /* === NEUTROS CÁLIDOS (derivados) === */
  --neutral-100: var(--color-white);
  --neutral-200: var(--color-crema);
  --neutral-300: var(--color-crema-dark);
  --neutral-400: var(--color-crema-darker);
  --neutral-500: #B8AFA3;
  --neutral-600: var(--color-carbon-soft);
  --neutral-700: #3A3530;
  --neutral-800: var(--color-carbon-mid);
  --neutral-900: var(--color-carbon);

  /* === TIPOGRAFÍA (definidas en layout.tsx via next/font) === */
  --font-sans:    var(--font-dm-sans), 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
}
```

### 11.1 Tokens semánticos (a agregar en Fase 2 de migración social)

Sobre los tokens crudos de arriba, la capa social v1 expone tokens semánticos para que los componentes no referencien colores de marca directamente:

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

  --border-default:      var(--color-crema-darker);
  --border-strong:       var(--neutral-500);

  --action-primary:      var(--color-azafran);
  --action-primary-hover:var(--color-canela);
  --action-secondary:    var(--color-albahaca);
  --action-highlight:    var(--color-azafran-light);
  --action-danger:       var(--color-paprika);

  --state-like-on:       var(--color-paprika);
  --state-save-on:       var(--color-azafran);
  --state-follow-on:     var(--color-albahaca);

  --focus-ring:          color-mix(in srgb, var(--color-azafran) 50%, transparent);
}
```

El bloque `.dark { ... }` en `globals.css` reasigna las variables crudas; los tokens semánticos heredan automáticamente la resolución.

---

## 12. Contraste y Accesibilidad

| Par | Ratio aprox. | WCAG AA | Uso |
|---|---|---|---|
| `#1A1714` sobre `#F8F4EE` | ~17:1 | **AAA** | Texto principal |
| `#5C564F` sobre `#F8F4EE` | ~7.2:1 | **AA/AAA** | Texto secundario |
| `#F8F4EE` sobre `#D4870A` | ~3.8:1 | **AA grandes** | Texto en botón primary (≥18px) |
| `#F8F4EE` sobre `#1A1714` | ~17:1 | **AAA** | Texto en footer, overlays |
| `#D4870A` sobre `#F8F4EE` | ~4.2:1 | **AA** | Labels, iconos de acento |
| `#D4870A` sobre `#1A1714` | ~5.8:1 | **AA** | Texto de marca en fondos oscuros |
| `#F5C842` sobre `#1A1714` | ~6.4:1 | **AA** | Ratings en footer |
| `#6B6358` sobre `#F8F4EE` | ~4.5:1 | **AA** | Texto de soporte |

**Regla práctica:** Para texto de body y UI usar siempre la escala `--neutral-*`. Los colores de marca (`--color-*`) son para fondos, bordes, íconos y texto grande (≥18px regular / ≥14px bold).

---

## 13. Modo Oscuro

El sistema soporta modo oscuro vía clase `.dark` en `<html>` (ver `app/layout.tsx` + `globals.css`). En dark mode se reasignan las variables crudas:

```css
.dark {
  --color-crema:        #1A1714;   /* fondo de página */
  --color-crema-dark:   #242018;
  --color-crema-darker: #3A3530;
  --color-carbon:       #F8F4EE;   /* el "texto principal" se invierte */
  --color-carbon-mid:   #D9D1C4;
  --color-carbon-soft:  #B8AFA3;
  /* Azafrán, Páprika, Albahaca y Canela no cambian — funcionan en ambos fondos */
}
```

Los tokens semánticos (`--text-primary`, `--surface-page`, `--action-primary`, etc.) heredan automáticamente los nuevos valores — no requieren override en `.dark`.

---

## 14. Lo que Cambia vs v1

| Elemento | v1 (rosa) | v2 aplicada (Especiería) |
|---|---|---|
| Color primario de marca / acción | `#ef7998` (rosa) | `#D4870A` (Azafrán) |
| Color de estados negativos | `#FF6B6B` (coral) | `#C03B28` (Páprika) |
| Color secundario / confirmaciones | `#4ECDC4` (turquesa) | `#3A6645` (Albahaca) |
| Fondo de página | `#FFFFFF` (blanco frío) | `#F8F4EE` (Crema) |
| Tipografía display | Source Sans 3 | **Cormorant Garamond** (serif editorial) |
| Tipografía UI | Source Sans 3 | **DM Sans** (sans neutral) |
| Sombras | Tono negro puro | Tono Carbón cálido |
| Gradiente principal | `#ef7998 → #F9E494` | `var(--color-azafran) → var(--color-azafran-light)` |

---

## 15. Moodboard Verbal

Para comunicar la dirección a colaboradores, diseñadores o herramientas de IA:

> "Una revista de cocina minimalista, pero con carácter. Fondo crema — no blanco, crema. Cormorant Garamond en los titulares, DM Sans limpia en el cuerpo. El color que manda es el dorado profundo del azafrán. El rojo ladrillo de la páprika queda reservado para errores y estados negativos. El verde de la albahaca como contrapeso fresco y signo de lo bueno (ratings altos, confirmaciones). El marrón de la canela como acento cálido para categorías. Sin gradientes de neón, sin sombras azuladas, sin fuentes display de moda. Fotografía cálida, platos como protagonistas. La UI debe sentirse como una publicación que vale la pena leer, no como una app de delivery."

---

*Versión 2.0 — Rediseño. Elaborado para orientar la migración del sistema visual del sitio web de CritiComida.*  
*Los principios de voz, arquitectura de información y jerarquía de entidades (plato > restaurante) siguen siendo los mismos — ver `brand-identity.md §13`.*

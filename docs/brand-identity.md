# CritiComida — Identidad de Marca

> Documento de referencia visual y tonal del proyecto. Fuente de verdad para decisiones de diseño, componentes y comunicación.

---

## 1. Nombre, Misión y Posicionamiento

### Nombre

| | |
|---|---|
| **Nombre oficial** | CritiComida |
| **Ortografía** | Una sola palabra, capital C y M. Nunca "Criti Comida" ni "criticomida" en textos visibles. El metadata de la app dice "Criticomida" — es un bug pendiente de corrección. |
| **Idioma** | Español (es) — todo el copy de la UI está en español. |
| **Contacto** | info@criticomida.com |

### Misión

Hacer que cada plato hable por sí mismo. CritiComida existe para que las personas descubran qué comer antes de pagar la cuenta — no si el lugar es bueno, sino **qué pedir**.

### Tagline

> *Cada plato, su reseña.*

El tagline captura el diferenciador real: la unidad de reseña es el plato, no el restaurante. Alternativas válidas:
- *"Descubrí los mejores platos antes de ir."*
- *"Reseñas honestas, plato por plato."*

No usar: *"Reseñas honestas de restaurantes, bares y cafés"* — describe lo mismo que Google Maps.

### Diferenciador de marca

CritiComida no reseña establecimientos como TripAdvisor. Reseña **platos individuales**. El restaurante es una agregación de sus platos — su rating surge del promedio de lo que sirve, no de una impresión general. Esta jerarquía debe verse en la UI: el plato es la entidad protagonista.

### Valores

- **Honestidad** — la reseña vale cuando no está pagada ni inflada.
- **Especificidad** — "el ramen de pollo" importa más que "el lugar en general".
- **Accesibilidad** — cualquier persona puede calificar, no solo expertos.

---

## 2. Logo y Mascota

### Descripción del logo

El logo de CritiComida es un **mascot character** encerrado en un badge circular. Está construido en SVG de 128×128px con los siguientes elementos:

| Capa | Descripción | Color |
|---|---|---|
| Fondo exterior | Círculo base | `#a7aece` (lavanda/periwinkle) |
| Overlay interior | Círculo interior semitransparente (opacidad 0.3) | blanco |
| Cuerpo del personaje | Forma de gota/copa estilizada | `#8f5653` (marrón cálido) |
| Relleno cuerpo | Interior del cuerpo | `#4bc190` (mint verde) |
| Ojos | Dos círculos blancos, radio 7.49 | blanco con pupila `#393c54` |
| Nariz | Pequeño rombo verde entre ojos | `#4bc190` |
| Boca/Sonrisa | Forma oval en la base del cuerpo | `#f85565` (coral) |
| Líneas de detalle | Bordes y expresión de los ojos | `#515570` (slate) |

El personaje transmite **calidez y simpatía** — es un crítico amistoso, no un juez serio.

### Archivos

| Archivo | Ruta | Uso recomendado |
|---|---|---|
| `logo.svg` | `/public/img/logo.svg` | Uso preferido. Escala sin pérdida. |
| `logopng.png` | `/public/img/logopng.png` | Cuando SVG no es viable (emails, docs externos). |
| `logosm.png` | `/public/img/logosm.png` | Navbar (40×40px). No escalar por encima de 80px. |

### Zona de exclusión

Mínimo `0.5× el diámetro del logo` de espacio libre alrededor del badge en todas las direcciones. Ejemplo: logo a 40px → 20px de margen libre.

### Combinación con wordmark

El ícono siempre acompaña al wordmark "CritiComida" en la navbar. El wordmark usa el gradiente de marca (`#ef7998 → #F9E494`). No separar el ícono del wordmark en contextos de navegación.

### Usos no permitidos

- No rotar el logo.
- No cambiar los colores internos del SVG.
- No aplicar el logo sobre fondos muy saturados sin testar contraste.
- No usar `logosm.png` por encima de 80px — usar `logo.svg` en su lugar.

---

## 3. Paleta de Colores

### 3.1 Sistema de colores: dos capas, un propósito

El proyecto tiene **dos capas de color que coexisten con roles distintos**:

| Capa | Tokens | Propósito |
|---|---|---|
| **Identidad de marca** | `--mainPink`, `--mainYellow`, gradiente | Logo, navbar brand, footer, gradientes decorativos. Lo que hace reconocible a CritiComida. |
| **Sistema funcional** | `--primary-*`, `--accent-*`, `--neutral-*` | Botones, formularios, cards, badges. Lo que hace la UI legible y usable. |

No son sistemas en conflicto. La capa de identidad define el carácter; la capa funcional resuelve la interfaz.

**Color primario de marca: `#ef7998` (mainPink)**
Es el rosa que aparece en el logo, el footer, el wordmark animado y los nav links. Es el color que identifica a CritiComida en cualquier contexto.

**Color primario de acción UI: `#FF6B6B` (coral)**
Es el coral que se usa en botones de acción principal. Es más saturado y legible que el pink de marca. No compite con él — cumple roles distintos.

---

### 3.2 Colores de Marca (Identidad)

| Token CSS | Hex | Nombre | Uso |
|---|---|---|---|
| `--mainPink` | `#ef7998` | Rosa CritiComida | **Color primario de marca.** Navbar links, footer brand, iconos, hover states. |
| `--mainYellow` | `#F9E494` | Amarillo CritiComida | **Color secundario de marca.** Gradientes, borde del footer, acentos decorativos. |
| `--yellowTrans` | `rgba(218,207,164,0.5)` | Amarillo translúcido | Fondo de la sección de reseñas en la home. |
| `--mainWhite` | `#ffffff` | Blanco | Fondos limpios, texto sobre fondos oscuros. |
| `--mainBlack` | `#000000` | Negro | Texto fuerte, fondos de contraste. |
| `--mainGrey` | `#EEEEEE` | Gris claro | Fondos neutros de secciones. |

**Gradiente de marca principal:**
```css
linear-gradient(90deg, #ef7998, #F9E494)
```
Usos: wordmark en navbar, underline de nav links, botón CTA del banner.

**Gradiente de marca invertido (hover):**
```css
linear-gradient(90deg, #F9E494, #ef7998)
```
Uso exclusivo: estado hover del botón banner.

---

### 3.3 Colores Funcionales (Sistema UI)

#### Primarios funcionales

| Token CSS | Hex | Nombre | Uso |
|---|---|---|---|
| `--primary-coral` | `#FF6B6B` | Coral | Botón de acción principal, títulos de cards, outline buttons. |
| `--primary-sage` | `#4ECDC4` | Sage | Botón secundario, badges de categoría, estados de focus. |
| `--primary-saffron` | `#FFB75E` | Azafrán | Estrellas de rating exclusivamente. |

#### Acentos (solo para estados de interacción)

| Token CSS | Hex | Uso exclusivo |
|---|---|---|
| `--accent-berry` | `#FF4B6E` | Hover del botón coral (`.btn-primary:hover`). |
| `--accent-mint` | `#00BD9D` | Hover del botón sage (`.btn-secondary:hover`). |
| `--accent-citrus` | `#FFD93D` | **Sin uso asignado.** Reservado para estados de "nuevo" o "destacado" si se implementa. No usar hasta que tenga rol definido. |

#### Neutros

| Token CSS | Hex | Uso |
|---|---|---|
| `--neutral-100` | `#FFFFFF` | Fondo de cards y superficies principales. |
| `--neutral-200` | `#F8F9FA` | Fondo de página, inputs en reposo. |
| `--neutral-300` | `#E9ECEF` | Bordes sutiles, separadores visuales. |
| `--neutral-400` | `#CED4DA` | Bordes de inputs. |
| `--neutral-500` | `#ADB5BD` | Elementos deshabilitados. |
| `--neutral-600` | `#6C757D` | Texto secundario / muted. |
| `--neutral-700` | `#495057` | Texto de soporte, metadatos. |
| `--neutral-800` | `#343A40` | Labels de formulario. |
| `--neutral-900` | `#212529` | Texto principal oscuro. |

#### Estados semánticos

| Estado | Color texto | Color fondo | Color borde |
|---|---|---|---|
| Éxito | `#1b5e20` | — | — |
| Error | `#c62828` | `#ffebee` | `#ffcdd2` |

---

### 3.4 Accesibilidad de Color (Contraste WCAG)

> Los colores de marca y los colores funcionales primarios son **colores de identidad y decoración**, no colores de texto sobre fondos blancos. Su contraste con fondo blanco no alcanza AA.

| Par de colores | Ratio aprox. | WCAG AA (texto normal) | Uso correcto |
|---|---|---|---|
| `#ef7998` sobre `#fff` | ~2.5:1 | Falla | Solo para elementos grandes, decorativos o íconos. |
| `#FF6B6B` sobre `#fff` | ~2.7:1 | Falla | Solo para títulos grandes (≥24px bold) o elementos decorativos. |
| `#4ECDC4` sobre `#fff` | ~2.0:1 | Falla | Solo decorativo. Nunca para texto sobre blanco. |
| `#ef7998` sobre `#18181b` | ~6.9:1 | **Pasa AA/AAA** | Footer brand, texto sobre fondos oscuros. |
| `#212529` sobre `#fff` | ~16:1 | **Pasa AAA** | Texto principal. |
| `#6C757D` sobre `#fff` | ~4.6:1 | **Pasa AA** | Texto secundario. |
| `#fff` sobre `#FF6B6B` | ~2.7:1 | Falla | No usar texto blanco pequeño sobre coral. |
| `#fff` sobre `#18181b` | ~18:1 | **Pasa AAA** | Texto en footer. |

**Regla práctica:** Para texto legible, usar siempre la escala de neutros. Los colores de marca y funcionales son para fondos de componentes interactivos, bordes, íconos y elementos visuales grandes.

---

## 4. Tipografía

### Familia

**Source Sans 3** — única fuente del proyecto, cargada desde Google Fonts.

```css
font-family: var(--font-sans);
/* = var(--font-source-sans-3), ui-sans-serif, system-ui, sans-serif */
```

La jerarquía tipográfica se construye con **peso y tamaño**, no con familias distintas. `--font-display` y `--font-sans` son el mismo token intencionalmente.

### Pesos cargados

| Peso CSS | Nombre | Cargado |
|---|---|---|
| `400` | Regular | Sí |
| `600` | Semibold | Sí |
| `700` | Bold | Sí |
| `800` | Extrabold | Sí |
| `900` | Black | **No.** El CSS del footer declara `font-weight: 900` pero este peso no se carga. El browser utiliza el peso 800 como fallback. Corregir a `800`. |

### Escala tipográfica

| Elemento | Tamaño | Peso | Clase |
|---|---|---|---|
| Body base | `1.0625rem` (~17px) | 400 | `body` |
| Line height | `1.6` | — | `body` |
| Banner title | `clamp(2rem, 8vw, 5rem)` | 800 | `.banner-title` |
| Footer brand | `2.2rem` | **800** (ver nota de peso 900) | `.footer-brand-modern` |
| Card title | `1.25rem` | 700 | `.gallery-card-title` |
| Nav link | `1.5rem` → `1.2rem` (sm) → `1rem` (xs) | — | `.nav-link` |
| Label de formulario | `0.95rem` | 600 | `.form-label` |
| Texto de soporte | `0.875rem` | 400 | `.form-text` |
| Service title | uppercase + `letter-spacing: 0.5rem` | — | `.service-title` |

---

## 5. Sistema de Espaciado y Border-Radius

### Border-radius: escala semántica

El radio refleja el **tipo de superficie**, no una decisión arbitraria:

| Radio | Valor | Tipo de superficie | Ejemplos |
|---|---|---|---|
| XS | `8px` | Elementos compactos e informativos | Alerts, filter buttons, badges de categoría, sort dropdowns |
| S | `12px` | Controles interactivos | Botones, inputs, selects |
| M | `16px` | Tarjetas y paneles de contenido | Gallery cards, imágenes de cards |
| L | `20px` | Píldoras y etiquetas de datos | Location badge, rating badge, tags inline |
| XL | `1rem (16px)` | Contenedor flotante | Navbar glassy |
| 2XL | `2rem (32px)` | Superficies decorativas estructurales | Footer (esquinas superiores) |

### Contenedor principal

```css
.cc-container {
  max-width: 72rem;   /* 1152px */
  margin: 0 auto;
  padding: 0 1rem;    /* → 1.25rem en ≥640px */
}
```

### Breakpoints

| Nombre | Valor | Cambios de layout |
|---|---|---|
| `sm` | `576px` | Tipografía reducida, nav links más compactos |
| `md` | `768px` | Navbar horizontal, parallax en banner y services |
| `lg` | `1024px` | (Tailwind default — grid de más columnas) |
| `xl` | `1280px` | (Tailwind default — expansión de contenido) |
| `2xl` | `1536px` | (Tailwind default) |

### Espaciado entre secciones

| Escala | Valor | Uso |
|---|---|---|
| Interna de card | `1.25rem / 1.5rem` | `.cc-card-body` padding |
| Gap de grids | `gap-4` (1rem) a `gap-6` (1.5rem) | Grids de cards |
| Navbar flotante | `mx-3 mt-3` | Separación del borde de viewport |

---

## 6. Gradientes

Solo existen **dos gradientes de marca** válidos. Un tercero (`btn-gradient`) usa colores fuera del sistema y está restringido.

| Nombre | Definición | Uso |
|---|---|---|
| **Gradiente primario** | `linear-gradient(90deg, #ef7998, #F9E494)` | Wordmark navbar, underline de nav links, botón CTA del banner, brand text en footer. |
| **Gradiente primario invertido** | `linear-gradient(90deg, #F9E494, #ef7998)` | Solo para estado hover del botón CTA del banner. |
| ~~Gradiente dorado~~ | `linear-gradient(90deg, #ffb347, #ffcc33)` | `.btn-gradient` — **uso restringido**: solo en contextos muy específicos donde el coral no sea apropiado. Los colores `#ffb347` y `#ffcc33` no pertenecen al sistema de tokens. Deprecar si es posible. |

---

## 7. Componentes Base

### 7.1 Botones

**Regla de uso:** un CTA por contexto. No apilar dos botones de igual jerarquía.

| Clase | Cuándo usar | Fondo | Hover |
|---|---|---|---|
| `.btn-primary` | Acción principal de la página | `#FF6B6B` | `#FF4B6E` + `translateY(-2px)` |
| `.btn-secondary` | Acción secundaria o de confirmación | `#4ECDC4` | `#00BD9D` + `translateY(-2px)` |
| `.btn-ghost` | Acción terciaria, cancelar | Transparente | Border/text coral + `translateY(-2px)` |
| `.banner-btn-animate` | CTA hero/banner exclusivamente | Gradiente primario | Gradiente invertido + `scale(1.08)` |
| `.btn-outline-primary` | Acción secundaria sobre fondos blancos | Transparente | Bg coral, texto blanco |
| `.btn-pink` | Contextos de color de marca (legado) | — | Bg negro, texto pink |
| `.btn-sm` | Acciones en espacios reducidos (tablas, inline) | — | Heredado |
| `.btn-lg` | CTAs con mayor énfasis visual | — | Heredado |

**Propiedades base compartidas:**
```css
border-radius: 12px;
font-weight: 600;
transition: 0.3s ease (background, color, transform, box-shadow);
```

---

### 7.2 Cards

#### Gallery Card (lista de restaurantes)
```css
border-radius: 16px;
border: 1px solid rgba(0, 0, 0, 0.08);
box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
/* hover: translateY(-4px), shadow → 0 8px 32px rgba(0,0,0,0.15) */
```

Imagen: ratio `4/3`, hover con `scale(1.03)` + `brightness(0.9) contrast(1.1)`.

**Badges sobre imagen:**
- Categoría (izquierda-arriba): fondo blanco/95, texto `orange-500`, radio `1.2em`
- Conteo de reseñas (derecha-arriba): fondo negro/75, texto blanco, radio `1.2em`

#### CC Card (card genérica / formularios)
```css
border-radius: 8px;
border: 1px solid var(--neutral-300);
box-shadow: 0 2px 4px rgba(0,0,0,0.06);
```

---

### 7.3 Navbar

Flotante, no sticky. Se posiciona con `mx-3 mt-3` sobre el contenido del banner.

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(10px);
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
border-radius: 1rem;
```

---

### 7.4 Footer

```css
background: #18181b;          /* zinc-900 */
border-radius: 2rem 2rem 0 0;
border-top: 4px solid var(--mainYellow);
```

Texto del brand en footer: `--mainPink`, `2.2rem`, `font-weight: 800` (corregir de 900), `letter-spacing: 0.08em`.

---

### 7.5 Formularios

| Elemento | Radio | Border reposo | Focus |
|---|---|---|---|
| `.form-control` | `12px` | `2px solid neutral-300` | Border sage + ring `rgba(78,205,196,0.2)` |
| `.form-select` | `12px` | `2px solid neutral-300` | Igual |
| `.alert` | `8px` | Según estado | — |

---

### 7.6 Badges y Filtros

```css
/* Filtro de categoría */
.filter-btn        { border-radius: 8px; background: neutral-200; color: neutral-700; }
.filter-btn.active { background: var(--primary-sage); color: white; }

/* Datos en cards */
.gallery-card-location { border-radius: 20px; background: neutral-200; }
.gallery-card-rating   { border-radius: 20px; background: rgba(255,183,94,0.15); }
.review-category-badge { border-radius: 8px; background: var(--primary-sage); }
```

---

## 8. Elevación y Sombras

| Nivel | CSS | Usado en |
|---|---|---|
| Base | `0 2px 4px rgba(0,0,0,0.06)` | CC cards genéricas |
| Sutil | `0 2px 12px rgba(0,0,0,0.08)` | Gallery cards en reposo |
| Media | `0 4px 20px rgba(0,0,0,0.10)` | Imágenes de cards |
| Elevada | `0 8px 32px rgba(0,0,0,0.15)` | Gallery cards en hover |
| Máxima | `0 12px 32px rgba(0,0,0,0.20)` | Imágenes en hover |
| Flotante | `0 8px 32px rgba(31,38,135,0.15)` | Navbar glassy (tono azulado intencional) |
| Botón coral | `0 4px 12px rgba(255,107,107,0.20)` | `.btn-primary` hover |
| Botón sage | `0 4px 12px rgba(78,205,196,0.20)` | `.btn-secondary` hover |

---

## 9. Animaciones y Microinteracciones

### Easing de marca

```css
cubic-bezier(0.4, 2, 0.6, 1)
```

Easing con overshoot (efecto resorte). Define el carácter "vivo" de la UI. Se usa en elementos de marca y navegación. Para transiciones de UI funcional se usa `ease` estándar.

### Patrones de hover

| Elemento | Transformación |
|---|---|
| Logo navbar | `scale(1.08) rotate(-2deg)` |
| Nav links | `scale(1.08)` + underline `scaleX(0→1)` |
| Gallery cards | `translateY(-4px)` |
| Imágenes de cards | `scale(1.03) translateY(-4px)` |
| Botones | `translateY(-2px)` |
| Banner CTA | `scale(1.08) translateY(-2px)` |
| Footer icons | `scale(1.18)` |

### Animaciones de entrada

| Clase | Movimiento | Duración |
|---|---|---|
| `.banner-animate-content` | `translateY(40px→0)` + `scale(0.98→1)` + fade | 1.1s, delay 0.2s |
| `.about-text-animate` | `translateX(-40px→0)` + fade | 1.1s, delay 0.2s |
| `.about-img-animate` | `translateX(40px→0)` + fade | 1.1s, delay 0.4s |
| `.gallery-image-container` | `galleryImageIn` (custom) | 0.8s |

### Duraciones estándar

| Tipo | Duración |
|---|---|
| Hover / micro-transición | `0.2s – 0.3s` |
| Animación de entrada | `0.8s – 1.1s` |

### Accesibilidad de movimiento

Implementado en `globals.css`. Cuando un usuario activa `prefers-reduced-motion: reduce`, todas las animaciones y transiciones se desactivan. El easing de marca no se aplica en este contexto.

---

## 10. Iconografía

**Biblioteca:** FontAwesome v6.7.2 (única librería de íconos del proyecto).

| Paquete | Uso |
|---|---|
| `@fortawesome/free-solid-svg-icons` | Íconos de UI: acciones, navegación, estado. |
| `@fortawesome/free-brands-svg-icons` | Logos de redes sociales en footer. |

No hay Lucide, Heroicons ni Material Icons. Toda necesidad nueva de íconos debe resolverse con FontAwesome Free o con SVGs inline propios.

---

## 11. Fotografía e Imágenes

### Estilo fotográfico

Las imágenes del proyecto son referenciales. Para nuevas fotos de platos y restaurantes, el criterio es:

- **Planos:** overhead (cenital) o 45° para platos individuales. Ambiente para exteriores de restaurante.
- **Temperatura:** cálida. Iluminación natural o artificial cálida. Evitar fotos frías o con dominante azul.
- **Foco:** el plato es el protagonista. Sin fondos desordenados ni demasiado contexto.
- **Personas:** opcionales. Si aparecen, en segundo plano o en gesto de disfrute, nunca en primer plano.

### Imágenes del sistema

| Categoría | Archivos | Notas |
|---|---|---|
| Banners | `banner.jpg`, `banner2.jpg` | Fondo con parallax en desktop. |
| About | `aboutnew.jpg`, `about.jpg`, `aboutsm.jpg`, `about2sm.jpg` | `aboutnew.jpg` es la versión actual. |
| Cocinas | `japanfood.jpg`, `koreanfood.jpg`, `mexfood.jpg`, `thaifood.jpg`, `brazilfood2.jpg`, `chinafood.jpg`, `arabicfood.jpg`, `israelfood.jpg`, `perufood.jpg` | Categorías de filtro. |
| Fallbacks | `food-fallback.jpg`, `restaurant-fallback.jpg` | Se muestran cuando el usuario no sube imagen. |
| Servicios | `store.png`, `delivery.png`, `vending.png` | Íconos de sección servicios. |

---

## 12. Modo Oscuro

**Estado actual:** no implementado. El sistema de color actual no tiene contraparte dark.

Si se implementa en el futuro, los tokens de marca mantienen su valor — el gradiente `#ef7998 → #F9E494` funciona bien sobre fondos oscuros (ver ratio en sección 3.4). Los neutrales deberían invertirse y los colores funcionales mantenerse o intensificarse ligeramente.

---

## 13. Tono de Voz

### Personalidad

CritiComida habla como **un amigo con criterio**: alguien que conoce la ciudad, va a lugares, y te dice directamente qué pedir. No es un crítico de alta cocina ni un turista entusiasta. Es honesto, concreto y cercano.

### Principios

| Principio | Correcto | Evitar |
|---|---|---|
| **Directo** | "Pedí el ramen de pollo." | "Te recomendamos considerar la opción de ramen." |
| **Específico** | "El croissant estaba húmedo por dentro, perfecto." | "La comida estuvo bien." |
| **Cercano** | "¿Vale la pena? Sí, pero llegá temprano." | "El establecimiento ofrece una experiencia satisfactoria." |
| **Sin condescendencia** | "No encontramos reseñas todavía." | "¡Aún no hay reseñas! ¡Sé el primero! 🎉" |

### Voz por contexto de UI

| Contexto | Ejemplo |
|---|---|
| CTA principal | "Ver platos" / "Descubrí el menú" |
| Estado vacío (sin reseñas) | "Todavía no hay reseñas de este plato." |
| Estado vacío (sin resultados) | "No encontramos restaurantes con ese filtro." |
| Error de red | "No pudimos cargar esto. Intentá de nuevo." |
| Éxito al guardar | "Reseña guardada." |
| Confirmación de borrado | "¿Eliminás esta reseña? No se puede deshacer." |
| Placeholder de búsqueda | "Buscá un restaurante o plato..." |

### Capitalización

- Secciones y títulos: primera letra mayúscula, resto minúsculas. Ejemplo: "Reseñas recientes", no "RESEÑAS RECIENTES".
- CTAs: frase completa en minúscula o capitalización normal. Ejemplo: "Ver más" no "VER MÁS".
- Nombre de la plataforma: siempre "CritiComida".

---

## 14. Referencia de Variables CSS

```css
/* === IDENTIDAD DE MARCA === */
--mainPink:    #ef7998
--mainYellow:  #F9E494       /* rgb(249, 228, 148) */
--mainWhite:   #ffffff
--mainBlack:   #000000
--yellowTrans: rgba(218, 207, 164, 0.5)
--mainGrey:    #EEEEEE       /* rgb(238, 238, 238) */

/* === SISTEMA FUNCIONAL: PRIMARIOS === */
--primary-coral:   #FF6B6B
--primary-sage:    #4ECDC4
--primary-saffron: #FFB75E

/* === SISTEMA FUNCIONAL: ACENTOS (solo hover states) === */
--accent-mint:    #00BD9D
--accent-berry:   #FF4B6E
--accent-citrus:  #FFD93D   /* sin uso asignado — reservado */

/* === NEUTROS === */
--neutral-100: #FFFFFF
--neutral-200: #F8F9FA
--neutral-300: #E9ECEF
--neutral-400: #CED4DA
--neutral-500: #ADB5BD
--neutral-600: #6C757D
--neutral-700: #495057
--neutral-800: #343A40
--neutral-900: #212529

/* === TIPOGRAFÍA === */
--font-sans:    var(--font-source-sans-3), ui-sans-serif, system-ui, sans-serif
--font-display: var(--font-source-sans-3), ui-sans-serif, system-ui, sans-serif
```

### Aliases Tailwind v4 (`@theme inline`)

| Clase Tailwind | Token |
|---|---|
| `text-main-pink` / `bg-main-pink` | `--mainPink` |
| `text-main-yellow` / `bg-main-yellow` | `--mainYellow` |
| `text-primary-coral` / `bg-primary-coral` | `--primary-coral` |
| `text-primary-sage` / `bg-primary-sage` | `--primary-sage` |
| `text-primary-saffron` / `bg-primary-saffron` | `--primary-saffron` |
| `text-accent-berry` / `bg-accent-berry` | `--accent-berry` |
| `text-accent-mint` / `bg-accent-mint` | `--accent-mint` |

---

## 15. Issues de Implementación Conocidos

| Issue | Ubicación | Estado |
|---|---|---|
| `--accent-citrus` sin uso | `globals.css` | Token reservado sin rol asignado. No usar hasta que se defina un propósito. |

---

*Fuente: extraído de `app/globals.css`, `app/components/Navbar.tsx`, `app/components/RestaurantCard.tsx`, `app/components/Footer.tsx`, `app/layout.tsx` y `public/img/logo.svg`.*

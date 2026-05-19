
# Servicios de IA en Palato — funcionalidades vigentes

Este documento es la **memoria viva de los servicios de IA** del
producto. Toca actualizarlo en el mismo PR que cambia un servicio. No
es un changelog; describe el estado actual.

> El producto **chatbot** (qué hacen los 3 agentes desde la perspectiva
> del usuario) vive en [`chatbot.md`](./chatbot.md). Este documento se
> enfoca en los **servicios subyacentes** y en quién los consume —
> tanto el chatbot como otros features de la app.

---

## Última actualización

- **Fecha**: 2026-05-19
- **Servicios activos**: agent loop multi-tool, embeddings de
  catálogo, búsqueda híbrida (filtros + KNN + proximidad), perfil de
  gustos, visión de plato (Ghostwriter + Sommelier multimodal), motor
  editorial de platos, sentiment de reseñas, auto-titulado de
  conversaciones, review-recall del Sommelier.
- **Cambios recientes (Ghostwriter locale-aware)** — el endpoint
  `POST /api/dish-reviews/assist[/upload]` ahora acepta `locale`
  (`es|en|pt`). El frontend lo manda desde `useLocale()` de la URL.
  `analyze_dish_photo(locale=...)` lo inyecta en el
  `system_instruction` vía un slot `__LANG__` del template
  (`_SYSTEM_INSTRUCTION_TEMPLATE` + `_system_instruction()`) más una
  regla dominante de idioma de salida que pisa el idioma de las
  muestras de voz del autor. `plating_style` queda como su enum fijo
  en inglés. `locale` ausente/desconocido cae a español: las tools de
  visión del chat (`suggest_tags_from_photo`,
  `identify_dish_from_photo`) **no** pasan locale a propósito, así que
  su comportamiento es idéntico al anterior. Detalle en la sección C.
- **Cambios recientes (C — Live Location)** — la búsqueda híbrida
  ganó un filtro de proximidad Haversine (sin API externa, sin
  PostGIS) alimentado por la ubicación viva del comensal. Detalle en
  la sección **D. Búsqueda híbrida**.
- **Cambios recientes (Sommelier review-recall, D2)** —
  nueva clase de `AsyncJob` que no usa IA pero comparte la
  infraestructura del worker: `kind='sommelier_review_recall'`,
  payload `(payload_user_id, payload_dish_id)`. El tool
  `recommend_dishes` encola un job por dish recomendado a un
  comensal autenticado, con `scheduled_at = now() +
  SOMMELIER_RECALL_DELAY_HOURS` (default 24h, configurable). El
  worker lo procesa cuando llega la hora y, si el comensal no
  reseñó el plato, escribe una `Notification` con el bot user
  `00000000-0000-4000-8000-50616c61746f` como `actor_user_id` y
  `target_dish_id` para el link al compose form.
  Dedup en 3 capas: partial UNIQUE index sobre el job, chequeo de
  review existente, chequeo de notificación previa. Migración 063.
  Detalle producto en `chatbot.md`.
- **Cambios recientes (context caching en agent_loop)** —
  `_ensure_cached_content` corre al inicio de cada `run()` y crea
  un `cachedContents/...` server-side cuando el prefijo
  (`system_instruction` + `tools`) supera ~4000 chars (~1024 tokens,
  el mínimo de Gemini). Mediciones de referencia: Sommelier ~18K
  tok, Business ~12K tok, Ghostwriter ~2.9K tok. Cuando hay cache
  activa cada `generate_content` paga ~25% por esos tokens en vez
  de 100%. TTL 30 min, registry process-local keyed por
  `sha256(model + system + tools)`. Kill switch:
  `AGENT_LOOP_CACHE_DISABLED=1`. Detalle en sección A.
- **Cambios recientes (token guard en agent_loop)** —
  `_truncate_contents_to_fit` corre al inicio de cada iteración del
  loop cuando `len(contents) > 12`. Cap default 800K tokens,
  bloques atómicos (`function_call` ↔ `function_response` siempre
  van juntos), última row nunca se droppea, fallo de
  `count_tokens` degrada a passthrough. Sección A del catálogo
  tiene el detalle completo.
- **Cambios recientes (backfill_sentiment vía Batch API)** —
  `backend/app/scripts/backfill_sentiment.py` ahora corre por
  default contra `client.aio.batches.create(model=gemini-2.5-flash,
  src=[InlinedRequest])`, con SLA de 24h y ~50% menos costo que el
  path sync. Comparte `build_sentiment_user_prompt` /
  `build_sentiment_config` / `parse_sentiment_response` con el live,
  así el output es bit-equivalente. Flags `--sync`, `--limit`,
  `--reanalyze`, `--resume`. Detalle completo en la sección G.
- **Cambios recientes (unificación sobre `google-genai` SDK)** —
  migración del transporte y del parsing en los 5 servicios de Gemini:
  - **Transporte único**: `embeddings_service`, `sentiment_service`,
    `vision_service` y `chat_title_service` dejaron de hablar REST
    crudo con `httpx`. Ahora todos pasan por `google-genai`
    (`client.aio.models.generate_content` / `embed_content`), igual
    que `dish_editorial_enricher` y el `agent_loop`. Cada servicio
    expone un `_get_client()` lazy que devuelve `None` cuando
    `GEMINI_API_KEY` está ausente — la degradación graciosa se
    mantiene idéntica a la del path anterior.
  - **Parsing tipado con `response_schema`**: `sentiment_service`,
    `chat_title_service`, `vision_service` y `dish_editorial_enricher`
    le pasan a Gemini un `BaseModel` (`_SentimentSchema`,
    `_TitleSchema`, `_VisionSchema`, `_EditorialSchema`) y leen
    `response.parsed` ya instanciado. Se eliminó el `json.loads` +
    validación defensiva de cada servicio. Las normalizaciones
    semánticas (clip de longitud, dedupe de tags, coerce label↔score,
    drop de `plating_style` fuera del set) siguen vivas como helpers
    *post-parse*, no como recuperación de JSON roto.
  - **Errores**: cada servicio captura `(genai_errors.APIError,
    httpx.HTTPError)` en `_PROVIDER_ERRORS` y degrada (None / dict
    vacío). El SDK envuelve la mayoría de los errores de transporte
    en `APIError`; mantenemos `httpx.HTTPError` por las conexiones
    rotas que pueden filtrarse antes del wrap.
  - **`thinking_budget=0`** se conserva donde ya lo teníamos
    (sentiment, chat_title, editorial). La memoria
    `feedback_gemini_thinking` sigue siendo invariante: Flash 2.5 en
    JSON-mode corto necesita budget cero para no truncar.
- **Cambios anteriores (capa de safety, audit a62a03a)** —
  migraciones 055 + 056:
  - **Notification guard** en `notification_service.py`. Las funciones
    `record_*_notification` (incluyendo `record_mention_notifications`,
    que dispara el Ghostwriter cuando sugiere arrobar) ahora chequean
    `should_deliver_notification(db, recipient_id, actor_id)` antes
    del `db.add(...)`. El guard lee `user_blocks` (cualquier
    dirección) y `user_mutes` (recipient → actor) — primitivas nuevas
    de la migración 055. Cualquier servicio IA que en el futuro emita
    notificaciones debe pasar por este helper para mantener el
    invariante de safety.
  - **Filtro de safety en `get_dish_detail` del Sommelier** — cerrado.
    `make_get_dish_detail_tool` recibe `user_id` opcional; cuando el
    comensal está autenticado, el handler dropea de `dish.reviews` las
    escritas por usuarios que él bloqueó o muteó antes de armar los
    `top_reviews` que ve el LLM. El filtro se aplica en memoria sobre
    el resultado del `selectinload` (las reviews por plato son decenas
    como mucho; reescribir la query no paga). El Business sigue NO
    propagando `user_id` a esta tool — su `get_dish_detail` es
    diagnóstico de pilares para el owner, no consumo social.
    `search_dishes` ya no expone reviews (devuelve platos), así que no
    requería cambio.
- **Cambios anteriores (hardening del audit)** — commit `7305ed7`:
  - **Rate-limit por usuario / IP** en cada endpoint que hace
    salida hacia un provider pago. Constantes vivas en
    `backend/app/middleware/rate_limit.py`:
    `CHAT_STREAM_LIMIT = "30/hour"` para `/api/chat/stream` y
    legacy `/api/chat`; `GHOSTWRITER_ASSIST_LIMIT = "20/hour"` para
    `/api/dish-reviews/assist` y `/assist/upload`. El bucketing
    sigue el patrón existente (`user_or_ip_key`): autenticados por
    `user_id`, anónimos por IP. Cualquier servicio nuevo que llame
    a Gemini / Anthropic / fal.ai debe declarar su propio
    `*_LIMIT` y decorarse con `@limiter.limit(...)`; no apoyarse en
    el cap "ambiental".
  - **SSRF guard** centralizado en `backend/app/services/_safe_url.py`
    (`safe_fetch_bytes`). Reemplaza el patrón previo
    `httpx.AsyncClient(follow_redirects=True).get(...)` que se
    repetía en `vision_service._fetch_image` y en
    `chat/tools/vision.py`. Reglas: scheme allowlist (`http`,
    `https`), DNS resolución upfront con denylist de rangos
    privados/loopback/link-local/multicast/reserved, sin redirects,
    cap de respuesta 16 MB. Cualquier servicio IA que tenga que
    dereferenciar una URL controlada por el usuario debe usar este
    helper — no abrir un `httpx.AsyncClient` directo.
  - **Validación de uploads** en `backend/app/services/_safe_upload.py`
    (`assert_image_or_raise`). Magic-bytes JPEG/PNG/WebP, cap 8 MB,
    extensión derivada del sniff (no del filename del cliente).
    Aplicado en el endpoint de Ghostwriter (`/assist/upload`) y en
    el endpoint de imágenes general (`/api/images/upload`). HEIC
    queda fuera del whitelist hasta que el pipeline re-encode en
    el server.
- **Pendiente / no cubierto**: ver
  [Roadmap conocido](#roadmap-conocido).

---

## Stack de proveedores

| Proveedor | Modelo / endpoint | Uso | Variable |
|-----------|-------------------|-----|----------|
| Google Gemini (vía `google-genai`) | `gemini-3.1-flash-lite-preview` | Sommelier + Business — agent loop con tools, streaming, multi-turn, persistencia nativa de `thoughtSignature`. | `CHAT_MODEL` / `CHAT_MODEL_B2C` / `CHAT_MODEL_B2B` (bare model name, sin prefijo) |
| Google Gemini (vía `google-genai`) | `gemini-3.1-flash-lite-preview` | Editorial blurb del catálogo de platos (one-shot JSON mode) | `EDITORIAL_MODEL` (cae a `CHAT_MODEL`) + `EDITORIAL_API_KEY` (cae a `CHAT_API_KEY` o `GEMINI_API_KEY`) |
| Google Gemini | `gemini-embedding-2` (768 dims con MRL) | Embeddings de reseñas y dishes para búsqueda semántica | `GEMINI_API_KEY` + `EMBEDDINGS_MODEL` |
| Google Gemini | `gemini-2.5-flash` | Visión multimodal para Ghostwriter | mismo `GEMINI_API_KEY` |
| Google Gemini | `gemini-2.5-flash` | Sentiment de reseñas (clasifica el texto en positive/neutral/negative + score) | mismo `GEMINI_API_KEY` |
| Google Gemini | `gemini-2.5-flash` | Auto-titulado de conversaciones de chat (4-8 palabras, JSON-mode) | mismo `GEMINI_API_KEY` |
| Resend | `/emails` | Notificación email a owner cuando se pide reserva | `RESEND_API_KEY` |

Si una key no está configurada, el servicio que la usa **degrada
graciosamente** en vez de romper:

- Sin `GEMINI_API_KEY` → search semántico cae a ranking estructurado;
  Ghostwriter devuelve arrays vacíos pero no falla; embeddings se
  saltan en backfill; el sentiment queda `null` y el dashboard del
  owner no rompe — los filtros por sentimiento simplemente no
  matchean reviews sin clasificar.
- Sin `CHAT_API_KEY` (Gemini) → el endpoint de chat cae a
  `GEMINI_API_KEY` como defensivo; sin ninguna de las dos el bot no
  tiene cómo responder y devuelve un error explícito.
- Sin `RESEND_API_KEY` → `send_email` loguea el payload (dry-run) y
  retorna `True`. Útil en dev.

---

## Servicios IA — catálogo

### A. Agent Loop multi-tool

`backend/app/services/chat/agent_loop.py` — orquestador propio,
agnóstico de framework (sin LangChain/LangGraph). Implementa:

- Registro de tools como `(name, JSONSchema, async handler)`.
- Loop ≤ 5 iteraciones; cada tool con timeout configurable (default 8s,
  visión 30s, business 15s).
- Stream SSE de eventos: `text_delta`, `tool_call_start`,
  `tool_call_result`, `card`, `message_complete`, `done`, `error`.
- Persistencia por mensaje en `chat_messages` con `tool_calls`,
  `tool_result`, `input_tokens`, `output_tokens`.
- Cancellation cooperativo: el cliente puede abortar el `fetch`
  intermedio y la sesión queda consistente.
- **Context caching server-side** (`_ensure_cached_content`): al
  inicio de cada `run()`, si el prefijo
  (`system_instruction` + `tools` serializados) supera 4000 chars,
  intentamos `client.aio.caches.create(...)` con TTL 30 min. La
  cache se identifica por `sha256(model + system + tools)` y vive
  en un dict process-local — sobrevive a través de turnos y de
  conversaciones que comparten exactamente el mismo prefijo
  (mismo agente + mismo user_block + mismos prefs). Cada
  iteración del loop usa `cached_content=<name>` en
  `GenerateContentConfig` y OMITE `system_instruction` + `tools`
  (vienen del cache, a ~25% del costo normal). Fallback inline si
  cache create falla o el prefijo está por debajo del mínimo.
  Mediciones de referencia (tokens cacheables):
  - Sommelier (`gemini-3.1-flash-lite-preview`): system ~11.8K +
    tools (12) ≈ **18K tok**
  - Business (`gemini-3.1-flash-lite-preview`): system ~6.6K +
    tools (10) ≈ **12K tok**
  - Ghostwriter (`gemini-3.1-flash-lite-preview`): system ~0.5K
    + tools (4) ≈ **2.9K tok**

  Kill switch: `AGENT_LOOP_CACHE_DISABLED=1` en el environment
  fuerza el path inline en todos los turnos (debug, regresión,
  comparación A/B). Trade-off conocido: el `user_block` y los
  `prefs_block` que se concatenan al `load_agent_prompt` en
  `chat_service` son per-user, así que cada usuario genera su
  propio cache. Cardinality acotada por el TTL de 30 min — si
  cache storage se vuelve costo, el next move es factor el
  `user_block` fuera de `system_instruction` y meterlo como
  primer user message.
- **Guard de ventana de contexto** (`_truncate_contents_to_fit`):
  antes de cada iteración del loop, si `len(contents) > 12`,
  llamamos a `client.aio.models.count_tokens(...)` incluyendo
  `system_instruction` + `tools`. Cuando el total supera el cap
  (default 800K, ~80% de 1M), agrupamos los contents en **bloques
  atómicos** y droppeamos del frente hasta que cae bajo el cap. Un
  bloque es:
  - Una row regular (user text o model text) — bloque de tamaño 1.
  - Un par `(model function_call, user function_response)` —
    bloque de tamaño 2. Gemini rechaza orphan halves, así que la
    truncación NUNCA parte un par.

  Invariantes:
  - El último bloque (la pregunta del usuario en el turno actual)
    nunca se droppea.
  - `system_instruction` va separado en `GenerateContentConfig` y
    queda intacto.
  - Si `count_tokens` falla (network/quota), seguimos con los
    `contents` originales y dejamos que el live call surface el
    error real — no inventamos truncado a ciegas.

  Performance: el `count_tokens` no consume quota pago pero suma
  ~100 ms por iteración cuando el guard arranca. Por eso el
  threshold de 12 rows — turnos cortos no pagan el costo.

**Consumidores**: chatbot (3 agentes).

### B. Embeddings — Gemini `gemini-embedding-2` (multimodal nativo)

`backend/app/services/embeddings_service.py`. Vectores L2-normalizados
de **768 dims** (Matryoshka Representation Learning: el modelo emite
3072 nativos y se truncan via `outputDimensionality` para mantener el
schema `pgvector(768)` actual sin migración).

`gemini-embedding-2` es **nativamente multimodal**: texto, imagen,
audio y video se proyectan al MISMO espacio semántico. Eso habilita
comparar un photo-embedding contra un dish-embedding (texto-derivado)
por cosine distance sin necesidad de tablas de embeddings separadas
ni re-indexación del catálogo.

Funciones expuestas:

- `embed_query(text)` — embedding ad-hoc de un query corto. Usado por
  `search_dishes(semantic_query=...)` para re-rankear el subset.
- `embed_documents(texts: list[str])` — batch. Usado para mantener las
  tablas `dish_review_embeddings` y `dish_embeddings` actualizadas.
- `embed_image(photo_bytes, mime_type)` — embedding multimodal de una
  imagen. Usado por `identify_dish_from_photo` (Sommelier) para
  matchear la foto del comensal contra `dish_embeddings`. NO pasa
  `taskType` (la API explícitamente no lo soporta para multimodal).
  Timeout 30s (vs 20s del path texto) por overhead del payload
  base64. Retorna `None` si Gemini está caído o el payload no se
  parsea.
- `reembed_review(review_id)` y `reembed_dish(dish_id)` —
  re-indexación puntual con `source_text_hash` para skipear cuando
  nada cambió.
- `schedule_reembed_review(review_id)` — fire-and-forget invocable
  desde un router después de que una review se crea/edita.

Script one-shot: `python -m app.scripts.backfill_embeddings`.

**Consumidores**:

- `search_dishes` (Sommelier + Business) — re-ranking semántico de
  texto.
- `benchmark_dish` (Business) — vecinos semánticos dentro de un radio.
- `identify_dish_from_photo` (Sommelier) — image embedding directo +
  KNN contra `dish_embeddings`. Aprovecha el espacio semántico
  unificado del modelo: el vector de la foto se compara contra
  vectores texto-derivados sin paso intermedio.

### C. Visión — Gemini `gemini-2.5-flash`

`backend/app/services/vision_service.py`. Multimodal call con
`response_mime_type=application/json` + JSON schema enforcado.

Devuelve: `tags`, `visible_ingredients`, `plating_style`,
`editorial_blurb`, `suggested_pros`, `suggested_cons`.

Robustez:

- Acepta foto por URL (la descargamos con timeout de 10s) o por bytes
  inline (uso típico desde un upload multipart).
- `_parse_partial_json` reconstruye JSON cuando Gemini se queda en
  `MAX_TOKENS` — cierra strings sin terminar y balancea brackets para
  rescatar lo que esté completo.
- Normaliza siempre antes de devolver: dedupe de tags, lowercase,
  límite de items, plating style fuera del enum se convierte en
  `null`.
- **Idioma de salida atado al locale del lector**: `analyze_dish_photo`
  toma `locale` (`es|en|pt`, default `es`) y renderiza el
  `system_instruction` desde `_SYSTEM_INSTRUCTION_TEMPLATE` reemplazando
  `__LANG__` por la etiqueta de idioma (`_lang_for()` mapea
  `es→español rioplatense`, `en→English`, `pt→português do Brasil`;
  un locale `en-US`/`pt-BR` resuelve por los 2 primeros chars). Una
  regla innegociable obliga a que `tags`, `visible_ingredients`,
  `editorial_blurb`, `suggested_pros` y `suggested_cons` salgan en ese
  idioma **incluso si las muestras de voz del autor están en otro** —
  `plating_style` es la única excepción (enum fijo en inglés). Locale
  ausente/desconocido cae a español, idéntico al comportamiento previo
  (las tools de visión del chat no pasan locale a propósito).
- **Blurb con voz del autor**: el endpoint del Ghostwriter inyecta al
  `system_instruction` las últimas 5 notas del usuario (≥30 chars,
  excluyendo el mismo `dish_id` para evitar auto-cita) vía
  `backend/app/services/user_style_service.py:fetch_style_samples`.
  El addendum acota el alcance a `editorial_blurb` — tags, ingredients,
  plating, pros y cons siguen siendo observacionales sobre la foto.
  Cuando el usuario no tiene reseñas previas suficientemente largas, el
  bloque se omite y el comportamiento es idéntico al original.

**Consumidores**:

- Ghostwriter — endpoint `POST /api/dish-reviews/assist[/upload]`
  (formulario de reseñas).
- Tool `suggest_tags_from_photo` — disponible al Ghostwriter dentro
  del chat.
- Sommelier — tool `identify_dish_from_photo`
  (`backend/app/services/chat/tools/vision.py`). La foto que adjunta
  el comensal vía el composer del chat (📎 →
  `/api/images/upload` con `entity_type=chat_attachment`) llega
  como prefijo `[foto: <url>]` en el mensaje; el system prompt
  matchea ese patrón y dispara el tool. La handler:
  (1) resuelve la URL a bytes (lectura desde `UPLOAD_DIR` para
  paths locales o fetch httpx con timeout 10s para URLs absolutas);
  (2) corre `analyze_dish_photo` y `embed_image` en paralelo via
  `asyncio.gather` — vision provee tags/ingredients para narración
  editorial, embed_image provee el vector de búsqueda directo;
  (3) llama `execute_dish_search` (helper extraído de
  `make_search_dishes_tool`) pasando el image vector como
  `query_vector`, lo que reusa toda la lógica de filtros, allergy
  guard y serialización. Si el image embed falla pero vision sigue
  ok, cae a un fallback de text-embed sobre los tags (rotulado
  `matched_via='vision_tags_text_embedding'`). La salida es
  **data-only** (no emite cards), igual que `search_dishes`: el
  agente lee `matches` y encadena `recommend_dishes` con los 1-3
  mejores.

### D. Búsqueda híbrida (filtros + KNN)

`backend/app/services/chat/tools/search.py`. La función
`search_dishes` aplica filtros estructurados como `WHERE` (barrio,
ciudad, bbox, mínimos por pilar via `EXISTS`, categoría, price tier)
**antes** del re-ranking semántico. El `semantic_query` opcional pasa
por `embed_query` y se ordena por `cosine_distance` sobre
`dish_embeddings`.

Si el LLM no manda `semantic_query` o Gemini está caído, ordena por
`computed_rating, review_count`. Garantiza que filtros duros nunca se
violen.

**C — Live Location (proximidad).** `search_dishes` y `surprise_me`
aceptan `near_lat`/`near_lng`/`radius_km`. El LLM los rellena desde el
bloque de grounding que arma `client_context.build_location_hint` a
partir de la ubicación viva del comensal (input de contexto del
**Sommelier únicamente**; Business está hard-pinned a un
`restaurant_scope_id` y no recibe ubicación). El filtro de distancia
es Haversine en SQL puro vía `app/services/_geo.haversine_km_expr` —
**sin API externa de geocoding**: la etiqueta humana ("cerca de
Palermo") sale del restaurante más cercano del propio catálogo,
consistente con el enfoque sin PostGIS. Default 3 km, tope 25 km. Sin
`semantic_query` el orden pasa a `dist ASC, rating DESC`; con él el
radio es filtro duro y el orden sigue siendo coseno.

Postura de privacidad: las coordenadas solo se envían si el navegador
ya concedió permiso (el chat nunca lo dispara), **no se persisten** en
`chat_messages`, y el prompt del Sommelier tiene instrucción explícita
de no recitarlas en crudo (habla en barrio/zona).

**Consumidores**: Sommelier, Business (vía scope).

### E. Perfil de gustos

`backend/app/services/taste_profile_service.py`. Job de aggregación
SQL que recompila para cada usuario:

- `dominant_pillar` — argmax de avg(presentation), avg(execution),
  avg(value_prop). Sólo cuando hay ≥3 ratings en el pilar.
- `top_neighborhoods` — top 3 substrings de `location_name` por reviews.
- `top_categories` — top 3 `Category.slug`.
- `avg_price_band` — bucket low/mid/high del promedio de `price_tier`.
- `favorite_tags` — top 5 de `dish_review_tags`.
- `preferred_hours` — top 3 horas (de `time_tasted` o fallback a
  `created_at.hour`).
- `allergies` — **no inferido nunca**, sólo via tool
  `update_taste_profile`.

Se inyecta en el system prompt del Sommelier y del Ghostwriter como
bloque "Sobre el comensal". El Business **no** lo recibe (los datos del
owner no entran a su agente).

`maybe_refresh_after_review(user_id)` se llama al crear/editar
reviews; el costo es aceptable porque la query es agregada y el set
por usuario es chico.

**Consumidores**: Sommelier (saludo + razonamiento), Ghostwriter
(menciona alergias declaradas).

### F. Notificaciones — emails transaccionales

`backend/app/services/email_service.py`. Wrapper liviano sobre Resend
con templates inline:

- `render_claim_approved`, `render_claim_rejected`, `render_claim_revoked` (claim flow).
- `render_reservation_requested` — disparado por `request_reservation`
  cuando un usuario pide una mesa en un restaurante claimed.

Falla **silenciosa**: el envío nunca propaga excepciones al caller —
sólo loguea. Diseño deliberado: un email caído no debe rollback la
acción del usuario (claim approve, reservation request).

**Consumidores**: tool `request_reservation` (Sommelier), claim flow
(no relacionado con chatbot pero usa el mismo servicio).

### G. Sentiment de reseñas — Gemini `gemini-2.5-flash`

`backend/app/services/sentiment_service.py`. Clasifica el texto de cada
`DishReview` (no las del crítico) en una etiqueta y un score numérico
para que el owner pueda triagear cuáles responder primero. Reusa el
mismo cliente HTTP / patrón JSON-mode del Ghostwriter (sección C).

Funciones expuestas:

- `analyze_review_text(text, rating)` — pura: devuelve
  `SentimentResult(label, score)` o `None` si Gemini no está
  configurado o la llamada falla. Llamada por el hot path y por el
  backfill.
- `analyze_and_persist_review(db, review_id)` — carga la review,
  clasifica y escribe `sentiment_label`, `sentiment_score`,
  `sentiment_analyzed_at`. Caller commitea.
- `schedule_analyze_review(review_id)` — fire-and-forget invocable
  desde un router. Abre **su propia** sesión (`async_session()`) en
  vez de captar la del request, así el job sobrevive al cierre de la
  request y nunca observa una sesión cerrada.

Schema reforzado por Gemini (`response_mime_type=application/json`):
`{label: enum[positive,neutral,negative], score: number ∈ [-1,1]}`.
El servicio reconcilia label vs score si llegan inconsistentes (raro
pero observado): si el modelo dice "positive" con score < -0.15, se
fuerza a "negative" y viceversa.

Visibilidad: el campo es **interno**. Sólo se serializa en
`OwnerReviewItem` (dashboard del owner) y en la salida del tool
`list_reviews` (chatbot Business). `DishReviewResponse`
(público) no lo expone.

Script one-shot: `python -m app.scripts.backfill_sentiment`. **Por
defecto corre vía Gemini Batch API** (`client.aio.batches.create`,
modelo `gemini-2.5-flash`), que tiene SLA de 24h pero cuesta ~50%
menos por request que el path sync. El script:

1. Toma snapshot de las reviews objetivo (id + note + rating) en una
   sesión corta y la cierra; la sesión NO queda abierta mientras el
   batch espera.
2. Construye un `InlinedRequest` por review reusando
   `build_sentiment_user_prompt` y `build_sentiment_config` del
   servicio — ambas paths comparten prompt + schema exactos, así el
   backfill nunca sesga la distribución de labels vs el live.
3. Envía en chunks de 1000 (cada chunk = 1 batch job, logueado por
   `display_name` y `name`).
4. Pollea cada 60s, log de progreso, máx 25h. Si el operador mata el
   proceso, el `name` ya está en stdout y se puede resumir con
   `--resume batches/<name>`.
5. Al estado terminal, walks `batch.dest.inlined_responses` en
   lockstep con los snapshots. **Importante**: en el path de batch
   `response.parsed` viene `None` (el SDK sólo post-procesa el
   `response_schema` en el sync path); `parse_sentiment_response`
   tiene un fallback que valida el JSON crudo de `response.text`
   contra `_SentimentSchema`, así el output es bit-equivalente al
   sync.
6. Si la longitud de respuestas no coincide con los requests
   (`PARTIALLY_SUCCEEDED`), el script REHÚSA persistir y loguea — el
   mapping por posición se rompería y mis-labelearía reviews.

Flags:

- `--reanalyze`: re-clasifica todo el corpus, igual que antes.
- `--limit N`: procesa sólo las primeras N reviews. Útil para smoke.
- `--sync`: cae al path legacy (Semaphore de 5, request por review).
  Necesario si el modelo target no soporta Batch en algún momento.
- `--resume batches/<name>`: pollea un batch ya creado en vez de
  crear uno nuevo. El snapshot tiene que matchear (mismas flags que
  la corrida original).

**Consumidores**:

- Owner dashboard — `GET /api/restaurants/{slug}/owner/reviews?sentiment=negative` y `?sort=sentiment_asc` (más negativas primero).
- Tool `list_reviews` (Business) — filtros componibles `responded_status` + `sentiment` + `sort` para que cualquier pregunta sobre reseñas resuelva con una sola llamada.

### H. Auto-titulado de conversaciones — Gemini `gemini-2.5-flash`

`backend/app/services/chat_title_service.py`. Hermano del sentiment
service: mismo modelo, misma forma (JSON-mode + schema +
`thinking_budget=0`), diferente trabajo. Se dispara desde
`chat_service.stream_chat` después del primer turno del usuario,
toma los primeros 2-4 mensajes (user + assistant) y devuelve un
título de 4-8 palabras en el idioma del primer mensaje del usuario,
sin signos de pregunta y sin emojis. Es **layered sobre el
heurístico**: el primer save de `conversation.title` en stream_chat
sigue siendo determinístico (truncado del primer user message)
para que el panel tenga algo que mostrar de inmediato; el LLM
swap-in ocurre 3-5 s después como background task. Trigger
controlado por `is_first_user_message` para evitar re-titular en
turnos posteriores.

Por qué Gemini Flash y no el modelo del agente: titulado no está
en el critical path del usuario, Flash es ~1¢ por 1k titulados,
JSON-mode es predecible y el `thinking_budget=0` (memoria
`feedback_gemini_thinking`) elimina la regresión histórica de
trunc-JSON en Flash 2.5.

### I. Motor editorial de platos — Gemini `gemini-3.1-flash-lite-preview`

`backend/app/services/dish_editorial_enricher.py`. Genera una
mini cápsula editorial sobre cada plato — origen + curiosidad
cultural — sin referencia al restaurante específico, para
alimentar el bloque "La historia de este plato" en
`/dishes/[id]`.

Output JSON (`response_mime_type="application/json"` con
`thinking_budget=0` para evitar burnear budget en una clasificación
trivial):

- `origin`: etiqueta corta (≤ 5 palabras) que ubica al plato en
  su tradición — "Cocina napolitana", "Sushi · Edo, Japón",
  "Asado rioplatense". Renderiza como chip en `EditorialStoryCard`.
- `story`: 2-3 oraciones (≤ 60 palabras) **en el idioma pedido**
  (es/en/pt — `SUPPORTED_LANGS`, default `es`) con origen + una
  curiosidad concreta (ingrediente clave, técnica, anécdota
  cultural, momento histórico). El system prompt parametriza el
  idioma de salida vía `_system_prompt(lang)`; las instrucciones
  siguen en español (el modelo las obedece igual).

Persistencia en `dishes` (solo el canónico **ES**):

- `editorial_blurb` ← `story` (es)
- `editorial_origin` ← `origin` (es)
- `editorial_blurb_lang` ← `"es"` — el dish row es el store
  canónico español que leen los metadatos de página y otros
  consumidores. **Los idiomas no-ES viven exclusivamente en
  `dish_editorial_cache`**, no se espejan al dish row.
- `editorial_blurb_source` ← `"gemini"` (uso interno; ya no se
  expone al usuario, antes formaba parte de la attribution editorial
  que se quitó por DMMT). Filas viejas pueden tener `"claude"` de
  cuando el enricher corría sobre Anthropic — se reescriben al
  refrescar.
- `editorial_prompt_version` ← `EDITORIAL_PROMPT_VERSION`
  (constante en el módulo) — bumpear esta string invalida los
  blurbs viejos sin tener que tocar el contenido.
- `editorial_cached_at` ← `now()`

**Cache compartida `dish_editorial_cache`**: un mismo plato
("milanesa", "asado", "sushi") puede aparecer en N restaurantes
y la historia es la misma. La cache se keyea por
`(name_key, cuisine_key, lang)` donde `name_key =
dish.name_normalized` (función SQL `public.dish_name_normalized`),
`cuisine_key` es el primer `cuisine_types` del restaurante en
lower (o `''` si no hay) y `lang ∈ {es,en,pt}` (migración 069 lo
agrega a la PK; filas viejas quedan `'es'`). Lookup antes de
llamar al LLM, upsert después con `ON CONFLICT DO UPDATE` para
race-safety. Versionada por `prompt_version`: cuando bumpea, los
lookups de versión vieja fallan y caen al LLM. El costo escala
con el número de **platos distintos × idiomas pedidos**, no con
`count(*) FROM dishes`.

Funciones expuestas:

- `refresh_dish_blurb(db, dish_id, *, lang="es", force=False)` —
  ES tiene fast-path por el dish row (staleness = versión +
  presencia); el resto se resuelve contra la cache de ese `lang`.
  Cache → LLM → persistir (cache siempre; dish row solo si ES).
  Idempotente: si ya está al día y `force=False`, retorna `False`.
- `get_cached_blurb(db, dish, restaurant, lang)` — lookup
  síncrono (sin LLM) que usa el endpoint para servir la historia
  en el idioma de la URL.
- `maybe_schedule_blurb_refresh(background_tasks, dish_id,
  lang="es")` — fire-and-forget desde el endpoint de detalle. La
  sesión del request ya está cerrada cuando corre el task, así
  que abre `async_session()` propia.

**Triggers**:

- Lazy: `GET /api/social/dishes/{dish_id}?lang=<locale>` sirve el
  blurb cacheado para `lang` (cae al ES del dish row solo cuando
  `lang=es` y no hay cache) y encola la generación del idioma
  pedido. Próxima visita en ese idioma ve la historia traducida.
  El frontend manda `?lang` con el locale de la URL desde
  `getDishDetail(id, locale)`.
- Admin/critic: `POST /api/social/dishes/{dish_id}/refresh-editorial`
  (forzar regeneración).
- Backfill: `python -m app.scripts.refresh_editorial_blurbs`
  (solo stale) o `--all` (limpia cache + regenera todo). Útil
  después de bumpear `EDITORIAL_PROMPT_VERSION`.

Degradación: sin `EDITORIAL_API_KEY` (o `CHAT_API_KEY` /
`GEMINI_API_KEY`), el servicio retorna `False` silenciosamente y
el bloque simplemente no se renderiza en el frontend.

**Consumidores**: página de detalle de plato
(`app/[locale]/dishes/[id]`) vía `EditorialStoryCard`.

---

### J. Clasificador de categoría de plato — Gemini `gemini-2.5-flash`

`backend/app/services/category_inference_service.py`. Reemplaza el
picker manual de 52 categorías que vivía en `/compose`: cuando el
usuario publica una reseña, el backend deriva la categoría a partir
del nombre del plato + nombre del restaurante + (cuando existe) el
`editorial_origin` / `editorial_blurb` ya enriquecidos por el motor
editorial (servicio I). El picker se eliminó del FE — la categoría
es 100% server-inferida ahora.

Output JSON (`response_mime_type="application/json"` con
`thinking_budget=0`, misma receta que sentiment — memoria
`feedback_gemini_thinking`):

```python
class _CategoryInferenceResponse(BaseModel):
    existing: _ExistingPick | None     # slug existente + confidence (0-1)
    proposed_new: _NewCategoryProposal | None  # slug nuevo + name + description
```

**Política de decisión** (en orden):

1. Si `existing` tiene confidence ≥ 0.6 y el slug existe en DB →
   se usa esa categoría.
2. Si `proposed_new` es coherente y su slug (slugificado a kebab-case
   ASCII) no colisiona con uno existente → se crea una nueva fila en
   `categories` con `pending_review = True, display_order = 999`. Se
   dispara `admin_notification_service.notify_admins_category_pending`
   que mete una row por admin en `notifications` (kind=
   `category_pending_review`) + email transaccional vía Resend
   (`render_category_pending_review`).
3. Si `proposed_new.slug` slugificado colapsa con uno existente, se
   trata como pick implícito de ese existente (no se duplica).
4. En cualquier otro caso (Gemini falla, ambos campos en null,
   confidence baja) → fallback duro a la categoría `otros`. El servicio
   nunca tira excepción; el peor caso es `(otros.id, was_newly_created=False)`.

**Persistencia**: la categoría se aplica a `restaurants.category_id`.
No existe una columna de categoría en `dishes` ni en `dish_reviews` —
el modelo de datos sigue siendo "restaurant tiene cuisine; los dishes
heredan". El servicio solo dispara cuando `restaurant.category_id IS
NULL` (no pisa categorías ya asignadas).

**Flag `pending_review` en `categories`** (migration 065): partial
index `ix_categories_pending_review` para que la cola del admin sea
barata. `GET /api/categories` filtra `pending_review = FALSE` así las
nuevas no aparecen en feeds públicos hasta que el admin las aprueba
desde `/admin/categorias-pendientes` (`POST /api/categories/{slug}/approve`
o `.../reject` con `target_slug` para re-asignar restaurantes).

**Descripciones enriquecidas** (migration 066): cada una de las 52
categorías canónicas tiene en `description` una línea de 1 rasgo + 4-6
platos típicos (ej: `"Cocina italiana: pizza napoletana, pasta, lasaña,
risotto, gnocchi, tiramisú"`). Eso funciona como few-shot dentro del
prompt — el modelo ancla el sentido de cada slug y deja de confundir
'pizzeria' con 'italiana' o de proponer slugs redundantes.

Endpoint admin nuevo:

- `GET /api/categories/pending` — lista las pendientes con
  `restaurant_count` para que el admin vea impacto antes de decidir.
- `POST /api/categories/{slug}/approve` — flip del flag a `False`.
- `POST /api/categories/{slug}/reject` con body `{target_slug}` —
  mueve restaurantes a `target_slug` (default `otros`) y borra la fila.

Degradación: sin `GEMINI_API_KEY` el servicio cae al fallback `otros`
y el post se publica igual con esa categoría. Cualquier excepción del
provider (`genai_errors.APIError`, `httpx.HTTPError`) también cae al
fallback — el flujo de creación de post nunca se rompe.

Latencia: el call bloquea el request de `POST /api/posts` mientras
Gemini responde (~500-1500 ms con `thinking_budget=0`). Si en
producción se vuelve relevante, el plan es asincronizar vía
`async_job_worker` (igual que sentiment) y persistir un placeholder.

**Consumidores**:

- `backend/app/routers/posts.py::create_post` — hook entre resolver
  el dish y persistir la review.
- `app/[locale]/admin/categorias-pendientes/` (FE admin) — cola de
  pendientes con approve/reject.

---

## Casos de uso end-to-end

### CU-IA-1 — Indexación incremental al publicar reseña

Cada vez que un usuario publica o edita una `DishReview`, encadenamos
embeddings + perfil de gustos como un side-effect.

```mermaid
sequenceDiagram
    participant User
    participant API as FastAPI router
    participant DB as Postgres + pgvector
    participant Gemini as Gemini Embeddings
    User->>API: POST /api/dishes/{id}/reviews
    API->>DB: INSERT dish_review
    API-->>User: 201 Created
    par fire-and-forget
        API->>Gemini: embed_documents([review_text, dish_aggregate_text])
        Gemini-->>API: vec(768) + vec(768)
        API->>DB: UPSERT dish_review_embeddings + dish_embeddings
    and
        API->>DB: SELECT recent reviews of user
        API->>API: recompute taste profile
        API->>DB: UPSERT user_taste_profiles
    end
```

**Notas**:

- El response al usuario llega antes de que terminen los jobs IA. El
  hash en `dish_embeddings.source_text_hash` evita re-embed cuando el
  texto agregado no cambió.
- Si Gemini falla, los vectores no se actualizan y se queda con la
  versión previa (mejor que invalidar todo).

### CU-IA-2 — Búsqueda híbrida con filtros + mood

Cuando el LLM extrae filtros estructurados + un `semantic_query`, el
backend filtra primero en SQL y re-rankea sólo el subset.

```mermaid
flowchart TD
    A[search_dishes args] --> B{¿hay semantic_query?}
    B -- No --> C[WHERE filtros<br/>ORDER BY rating DESC]
    B -- Sí --> D{¿GEMINI_API_KEY ok?}
    D -- No --> C
    D -- Sí --> E[embed_query semantic]
    E --> F[WHERE filtros<br/>+ JOIN dish_embeddings<br/>ORDER BY cosine_distance ASC]
    C --> G[Devolver dishes serializados]
    F --> G
```

**Notas**:

- Filtros son siempre AND. Un mínimo por pilar (ej: `min_value_prop=3`)
  se traduce a `EXISTS (SELECT 1 FROM dish_reviews WHERE dish_id =
  Dish.id AND value_prop >= 3)` para no inflar el join.
- En modo Business, `restaurant_scope_id` agrega un filtro extra:
  `Restaurant.id == scope_id`. Imposible que el LLM lo borre por
  más que se lo pidamos en el prompt.

### CU-IA-3 — Análisis visual del plato (Ghostwriter)

```mermaid
sequenceDiagram
    participant User
    participant FE as DishReviewForm
    participant API as POST /assist/upload
    participant Vision as Gemini Vision
    User->>FE: Sube foto
    User->>FE: Click "Pedir asistencia"
    FE->>API: multipart (photo, dish_id, draft_text, locale)
    API->>API: lookup dish.name como hint
    API->>API: render system_instruction en el idioma de `locale`
    API->>Vision: generateContent (system + image inline + JSON schema)
    Vision-->>API: candidates[0].content.parts[0].text
    API->>API: parse JSON (tolerante a truncado)
    API->>API: normalizar tags / dedupe / cap
    API->>API: filtrar new_tags vs draft_text
    API-->>FE: AssistResponse
    FE->>FE: Render chips clicables
    User->>FE: Adopta tags / pega blurb
```

**Notas**:

- Si `finishReason==MAX_TOKENS`, `_parse_partial_json` rescata lo que
  alcanzó a cerrar. Mejor degradar a "tags y blurb sí, pros/cons quizás
  no" que devolver vacío.
- La foto subida desde el panel del Ghostwriter se mirror-ea al post
  del usuario (callback `onPhotoUploaded`).
- `locale` viene de `useLocale()` (la URL `/es|/en|/pt`); toda la
  salida (tags, blurb, pros/cons) sale en ese idioma. Ver "Idioma de
  salida atado al locale del lector" en la sección C.

### CU-IA-4 — Tool loop agentic (común a los 3 agentes)

```mermaid
sequenceDiagram
    participant FE
    participant API as POST /api/chat/stream
    participant Loop as AgentLoop
    participant LLM as Gemini
    participant Tools
    participant DB
    FE->>API: { message, agent, conversation_id }
    API->>DB: persistir user message
    API->>Loop: run(system, messages)
    loop ≤ 5 iteraciones
        Loop->>LLM: stream completion (system + history + tools)
        LLM-->>Loop: text deltas + tool_use blocks
        Loop-->>FE: SSE text_delta…
        Loop-->>FE: SSE message_complete
        alt hay tool_calls
            Loop->>Tools: ejecutar (timeout, validation)
            Tools->>DB: query / mutate
            Tools-->>Loop: result JSON
            Loop-->>FE: SSE tool_call_result + card
            Loop->>Loop: append role=tool message
        else stop_reason=end_turn
            Loop-->>FE: SSE done
        end
    end
    API->>DB: persistir assistant + tool rows
```

**Notas**:

- Cada `message_complete` se persiste apenas se emite. Aborto de
  conexión deja un transcript coherente para auditoría (clave para
  Business).
- Tools que fallan no rompen la sesión: el error se inyecta como
  `tool_result.is_error=true` y el modelo decide cómo recuperarse.

### CU-IA-6 — Sentiment async al crear/editar una reseña

```mermaid
sequenceDiagram
    participant User
    participant API as FastAPI router
    participant DB as Postgres
    participant Gemini as Gemini Flash (sentiment)
    User->>API: POST /api/dishes/{id}/reviews (o PUT con note nuevo)
    API->>DB: INSERT/UPDATE dish_review
    API-->>User: 201 / 200 OK
    par fire-and-forget (sesión propia)
        API->>API: schedule_analyze_review(review_id)
        API->>DB: SELECT review.note + rating
        API->>Gemini: generateContent (system + note + rating, JSON schema)
        Gemini-->>API: {label, score}
        API->>DB: UPDATE dish_reviews SET sentiment_label, sentiment_score, sentiment_analyzed_at
    end
```

**Notas**:

- `schedule_analyze_review` abre `async_session()` propia: la sesión
  del request ya está cerrada cuando el task corre, así que no se
  puede reusar como sí hace `schedule_reembed_review`.
- En PUT, sólo se schedulea cuando `note` cambió (un edit de rating
  o tags no toca el sentimiento). El servicio igual es idempotente.
- Si Gemini falla o `GEMINI_API_KEY` no está, los campos quedan
  `null`. El próximo edit del usuario o el script de backfill cubren
  el reintento — no hay queue con retries todavía.

### CU-IA-7 — Foto de plato → match contra catálogo (Sommelier multimodal)

```mermaid
sequenceDiagram
    participant User as Comensal
    participant FE as ChatDrawer
    participant Up as POST /api/images/upload
    participant Stream as POST /api/chat/stream
    participant Loop as AgentLoop (Sommelier)
    participant Ident as identify_dish_from_photo
    participant Vision as Gemini 2.5 Flash (vision)
    participant Embed as Gemini Embedding 2 (multimodal)
    participant DB as Postgres + pgvector
    User->>FE: 📎 elige foto + escribe "qué es esto"
    FE->>Up: multipart (file, entity_type=chat_attachment)
    Up-->>FE: { url: "/uploads/abc.jpg" }
    FE->>Stream: { message: "[foto: /uploads/abc.jpg] qué es esto" }
    Stream->>Loop: run(system, messages)
    Loop->>Ident: identify_dish_from_photo(photo_url=...)
    Ident->>Ident: leer bytes de disk (UPLOAD_DIR) o fetch httpx
    par paralelo: vision + image-embed
        Ident->>Vision: analyze_dish_photo(photo_bytes, mime)
        Vision-->>Ident: { tags, visible_ingredients, plating_style, ... }
    and
        Ident->>Embed: embed_image(photo_bytes, mime)
        Embed-->>Ident: vec(768) en el mismo espacio que dish_embeddings
    end
    alt image vector ok (path normal)
        Ident->>DB: execute_dish_search query_vector=image_vector
        DB-->>Ident: top-N dishes (filtrados por allergies)
        Ident-->>Loop: { matches, detected, matched_via='multimodal_image_embedding' }
    else image vector falla pero vision tiene tags (degradado)
        Ident->>Embed: embed_query("ramen shoyu chashu …")
        Embed-->>Ident: vec(768) text-derived
        Ident->>DB: execute_dish_search query_vector=text_vector
        DB-->>Ident: top-N dishes
        Ident-->>Loop: { matches, detected, matched_via='vision_tags_text_embedding' }
    else todo falla
        Ident-->>Loop: { matches: [], no_signal: true | vision_unavailable: true }
        Loop-->>FE: text "no se deja leer la foto"
    end
    Loop->>Loop: elegir 1-3 mejores
    Loop->>Loop: recommend_dishes(dish_ids=[..])
    Loop-->>FE: SSE card + text editorial
```

**Notas**:

- **Por qué multimodal embed directo**: la versión previa pasaba
  `tags + ingredients` por `embed_query` (texto), introduciendo
  pérdida de señal en el paso de tagging. Con
  `embed_image(photo_bytes)` el matching usa toda la información
  visual (color, plating, composición exacta) sin compresión a
  texto, y el vector resultante vive en el mismo espacio que los
  `dish_embeddings` texto-derivados gracias al training cross-modal
  de Gemini Embedding 2.
- **Vision sigue corriendo**: aunque ya no se usa para construir un
  `semantic_query`, su output (`detected.tags`,
  `detected.visible_ingredients`, `detected.plating_style`)
  alimenta la respuesta editorial del agente ("se ve a un ramen
  shoyu con chashu y huevo marinado"). Sin esto el bot no podría
  confirmar verbalmente lo que ve y el comensal pierde la
  certeza de que la foto fue leída.
- **Filtro de alergias**: `execute_dish_search` aplica el mismo
  guard que `search_dishes`, así que las alergias declaradas se
  respetan en el path multimodal sin código duplicado.
- **Resiliencia**: si solo el image embed falla (raro, p.ej. HEIC
  problemático), el fallback de text-embed sobre los tags conserva
  el matching. `matched_via` informa al agente qué path se usó —
  útil para debugging y para evals que quieran filtrar por path.
- **Timeout del tool**: 35s. Como vision + embed corren en paralelo
  via `asyncio.gather`, el wall time es el max de ambos (vision
  ~10-25s, embed ~1-3s).
- **Diferencia con `suggest_tags_from_photo` (Ghostwriter)**: este
  NO emite card, NO genera blurb editorial, NO sugiere pros/cons.
  Devuelve matches contra el catálogo + el dump de visión para que
  el agente lo cite.

### CU-IA-8 — Review-recall del Sommelier (no-IA, ride-along del worker)

```mermaid
sequenceDiagram
    participant Diner
    participant Sommelier as Sommelier (agent_loop)
    participant Tool as recommend_dishes
    participant Queue as async_job
    participant Worker as async_job_worker
    participant DB as Postgres

    Diner->>Sommelier: "¿qué pido en La Vinoteca?"
    Sommelier->>Tool: recommend_dishes(dish_ids=[r1, r2])
    Tool->>DB: load dishes + allergy filter + wishlist
    Tool->>DB: filter dish_ids NOT IN dish_reviews(user)
    Tool->>Queue: INSERT async_job × N (scheduled_at = now() + 24h)
    Note over Queue: partial UNIQUE (kind, user, dish) WHERE pending<br/>colapsa duplicados
    Tool-->>Sommelier: cards
    Sommelier-->>Diner: respuesta + grid

    Note over Worker,DB: ... 24h después ...
    Worker->>Queue: claim FOR UPDATE SKIP LOCKED<br/>WHERE scheduled_at <= now()
    Worker->>DB: EXISTS dish_review(user, dish)?
    alt diner already reviewed
        Worker->>Queue: mark done — no notification
    else nothing yet
        Worker->>DB: EXISTS notification(recipient, kind, dish)?
        alt already notified
            Worker->>Queue: mark done
        else fresh recall
            Worker->>DB: should_deliver_notification(user, bot)
            Worker->>DB: INSERT notification(kind='sommelier_review_recall', actor=bot, target_dish_id)
            Worker->>Queue: mark done
        end
    end
```

**Notas**:

- **Sin IA en el camino del worker**. Aunque la entrada al queue
  viene del agent loop, el procesamiento es puramente SQL: dos
  EXISTS, un guard de safety, un INSERT. El job consume tokens
  cero. Vive en este catálogo solo porque comparte la
  infraestructura (`async_job` + `async_job_worker`) que se
  introdujo para `embed_review` / `sentiment_review`, y porque el
  trigger lo dispara el chatbot.
- **`scheduled_at` ya existía** en `async_job` desde la migración
  053 (`ix_async_job_pending` cubre `(kind, scheduled_at)`). El
  worker hace `WHERE scheduled_at <= now()`, así que un INSERT con
  `scheduled_at = now() + 24h` simplemente no se pickea hasta que
  el tiempo llega. Esto reemplaza la necesidad de un cron externo.
- **Idempotency contract** del handler
  (`process_sommelier_review_recall`): re-correr el mismo job N
  veces deja la DB en el mismo estado. Esto importa porque el
  worker reintenta con backoff lineal hasta `MAX_ATTEMPTS=5` ante
  cualquier excepción transitoria.
- **Bot user**: la migración 063 inserta
  `00000000-0000-4000-8000-50616c61746f` con `password_hash`
  inválido (`'!system-no-login!'`). El handle es `sommelier`,
  display name `Sommelier`. Reutilizable para futuras
  notificaciones del agente sin schema-changes.
- **Configuración**: `SOMMELIER_RECALL_DELAY_HOURS` en
  `Settings`. Cambiar el delay no requiere migración ni deploy de
  código — solo un redeploy con la env var nueva.
- **Anónimos quedan fuera**: el tool handler pone un guard
  `if user_id is not None and kept_dishes:` antes del enqueue.
  Sin `user_id` no hay destinatario para la notificación.

### CU-IA-5 — Diagnóstico de pilar (Business)

```mermaid
flowchart LR
    A[analyze_dish_pillar_drop dish_id pillar] --> B[Validar dish in scope]
    B --> C[avg pillar últimos N días]
    B --> D[avg pillar prior N días]
    B --> E[reviews recientes con keywords negativos<br/>OR pillar score = 1]
    C --> F[Componer respuesta]
    D --> F
    E --> F
    F --> G[Bot redacta delta + cita snippets textuales]
```

**Notas**:

- Keywords negativos por pilar son listas en `business.py`
  (`_NEGATIVE_KEYWORDS`). Si la cobertura de keywords queda chica
  para nuevos clusters de queja, ampliar ahí — no hace falta tocar el
  prompt.
- El bot está instruido por system prompt a citar literal sin
  inventar; el snippet ya viene cortado a 280 chars.

---

## Cómo agregar un servicio IA o un consumidor nuevo

1. **Definí el servicio** en `backend/app/services/` con interfaz
   pequeña y degradación graciosa cuando falte la key.
2. **Agregalo al stack de proveedores** arriba en este doc, con la
   variable de entorno y el modelo concreto.
3. **Listalo en el catálogo** (sección correspondiente: A, B, C, D,
   E, F o nueva). Documentá funciones expuestas y consumidores.
4. Si lo expone el chatbot:
   - Sumá el tool en `app/services/chat/tools/<area>.py`.
   - Registralo en `tools/registry.py` para los agentes que aplican.
   - Documentá la capacidad nueva en
     [`chatbot.md`](./chatbot.md) (no acá).
5. **Agregá un caso de uso** end-to-end con flujograma mermaid en la
   sección correspondiente. Si es estructuralmente nuevo (no entra en
   ninguno de los CU-IA-1 a 5 ni en una variante), creá CU-IA-N+1.
6. **Si requiere migración de DB** (vector dim distinto, tabla nueva
   para cache, etc.), documentá en el catálogo la consecuencia
   operacional (correr backfill, etc.).
7. Actualizá la fecha y la lista de servicios activos arriba.

---

## Roadmap conocido

Capacidades discutidas durante el diseño que **todavía no están
implementadas**:

- **Embeddings**: queue real con reintentos (hoy: `asyncio.create_task`
  fire-and-forget; un caller que muere antes de que el task corra
  pierde la indexación). Migrar a Celery / RQ / equivalente cuando el
  volumen lo amerite.
- **Embeddings**: re-indexación masiva incremental (hoy el script
  scanea todos los dishes; con corpus grande hay que paginarlo).
- **Visión**: caché de respuestas por `hash(image_bytes)` para evitar
  re-cobrar Gemini cuando el usuario pega la misma foto en otro
  contexto.
- **Visión**: clasificador local (modelo más liviano) para filtrar
  fotos que claramente no son de plato antes de gastar Gemini.
- **Perfil de gustos**: UI dedicada para que el usuario lea/edite su
  perfil (hoy sólo via API).
- **Perfil de gustos**: versionado del algoritmo (`version` ya está
  en la tabla pero no lo usamos para invalidar masivamente cuando
  cambia la heurística).
- **Notificaciones**: push web/mobile además de email + in-app.
- **Observabilidad IA**: dashboard de tokens consumidos / latencia /
  tasa de error por modelo. Hoy hay logging estructurado, no
  agregación.
- **Modelos**: A/B entre Gemini Flash y Gemini Pro para el Sommelier
  cuando los volúmenes lo justifiquen (Pro razona mejor en queries
  con muchos criterios cruzados, Flash es ~5x más barato y más rápido
  para el caso típico).

Cuando se implemente cualquiera, mover a la sección activa y borrar
de acá.

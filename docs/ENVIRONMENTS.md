# Entornos y credenciales

Referencia operativa de cómo están armados dev y prod, qué variables vive en cada lado, y cómo rotar/distribuir credenciales.

> Resumen ejecutivo en [README.md](../README.md). Este documento es para cuando necesitás los detalles.

---

## Topología

```
┌─────────────────────── DEV (local) ──────────────────────┐
│  npm run dev (host, puerto 3000)                         │
│      │                                                   │
│      ▼  http://localhost:8002                            │
│  docker compose (backend/)                               │
│   ├── api      FastAPI, alembic on start, uvicorn x 2    │
│   └── db       Postgres 16, volumen pgdata persistente   │
│                seed inicial = snapshot one-time de prod  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────── PROD ────────────────────────────┐
│  Vercel (Next.js)  https://palato.me                     │
│      │                                                   │
│      ▼  https://api.palato.me   (mismo site: palato.me)  │
│  Railway: criticomida-backend-production                 │
│   ├── service api  Dockerfile + entrypoint.sh            │
│   └── service postgres  managed, separado de dev         │
└──────────────────────────────────────────────────────────┘
```

> **Por qué dominio propio y no `*.vercel.app` + `*.up.railway.app`:** son
> dominios registrables distintos, así que las cookies de auth que setea el
> backend son *third-party* para el browser. Safari (ITP) las bloquea siempre
> y Chrome/Firefox las bloquean/particionan → el `refresh_token` no viaja y el
> usuario se desloguea apenas caduca el access token (~15 min). Con
> `palato.me` + `api.palato.me` (mismo site `palato.me`) las cookies son
> first-party y persisten. Ver runbook *Migración a dominio propio* abajo.

Las dos DBs son completamente independientes. Modificar dev no afecta prod y viceversa. El único puente es manual: `pg_dump` desde prod → `pg_restore` en dev cuando querés refrescar el baseline.

---

## Frontend env

Next.js carga estos archivos por convención. El que aplica depende del comando:

| Archivo                       | Cuándo se carga              | Committed | Contiene secretos |
|-------------------------------|------------------------------|-----------|-------------------|
| `.env.development`            | `npm run dev`                | sí        | no                |
| `.env.development.local`      | `npm run dev` (override)     | no        | sí                |
| `.env.production`             | `npm run build` / `start`    | sí        | no                |
| `.env.production.local`       | `npm run build` (override)   | no        | sí (raro en local)|
| `.env.example`                | nunca; sólo template         | sí        | no (placeholders) |

Vercel **no** lee archivos del repo para prod — todas las variables se setean en la UI de Vercel (o `vercel env`).

### Variables

| Variable                          | Dev (`.env.development[.local]`)        | Prod (Vercel UI)                                              | Notas |
|-----------------------------------|------------------------------------------|---------------------------------------------------------------|-------|
| `NEXT_PUBLIC_API_URL`             | `http://localhost:8002`                  | `https://api.palato.me`                                       | Browser-exposed. **Debe** ser mismo site que el dominio del front (`palato.me`) o las cookies se vuelven third-party. |
| `NEXT_PUBLIC_SOCIAL_MOCK`         | `true`                                   | `false`                                                       | Cuando es `true` la UI de feed usa mocks. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | dev key                                  | prod key                                                      | Browser-exposed. Restringir por dominio en Google Cloud. |

---

## Backend env

| Archivo            | Cuándo se carga                  | Committed | Contiene secretos |
|--------------------|----------------------------------|-----------|-------------------|
| `backend/.env`     | `docker compose up` (vía compose)| no        | sí                |
| `backend/.env.example` | template para copiar          | sí        | no                |
| Railway dashboard  | runtime en prod                  | —         | sí                |

`docker-compose.yml` lee `backend/.env` automáticamente y lo inyecta al servicio `api` y al servicio `db`.

### Modos locales

- **Full-docker (default)**: api y db ambos en compose. `DATABASE_URL=postgresql+asyncpg://criticomida:criticomida_secret@db:5432/criticomida` — el host es `db` (nombre del servicio dentro de la red de compose).
- **Hybrid**: db en compose, uvicorn corriendo en el host (útil para debugger). En ese caso usá `localhost:5433` (compose mapea `5433:5432`).

### Variables

| Variable                          | Dev (`backend/.env`)                                      | Prod (Railway UI)                                       | Notas |
|-----------------------------------|------------------------------------------------------------|---------------------------------------------------------|-------|
| `DATABASE_URL`                    | `...@db:5432/criticomida`                                 | auto-inyectada por el servicio Postgres de Railway      | Asyncpg driver. |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `criticomida` / `criticomida_secret` / `criticomida` | no aplican (Railway gestiona el Postgres)               | Usadas por compose para inicializar el contenedor `db`. |
| `JWT_SECRET`                      | cualquier string >=32 chars                                | `openssl rand -hex 32`, **distinto** al de dev          | Rotar si se filtra. |
| `JWT_ALGORITHM`                   | `HS256`                                                    | `HS256`                                                 |       |
| `JWT_ISSUER` / `JWT_AUDIENCE`     | `palato-api` / `palato-clients`                  | igual                                                   |       |
| `ACCESS_TOKEN_EXPIRE_MINUTES`     | `30` (cómodo en dev)                                       | `15`                                                    | Más corto en prod. |
| `REFRESH_TOKEN_EXPIRE_DAYS`       | `7`                                                        | `7`                                                     |       |
| `APP_ENV`                         | `development`                                              | `production`                                            |       |
| `COOKIE_SECURE`                   | `false`                                                    | `true`                                                  | `Secure` cookies requieren HTTPS — sólo prod. |
| `CORS_ORIGINS`                    | `http://localhost:3000,...`                                | `https://palato.me`                                     | Coma-separado. El origin **exacto** del front (sin path, sin slash final). |
| `PUBLIC_APP_URL`                  | `http://localhost:3000`                                    | `https://palato.me`                                     | Base para links absolutos en emails (verify, owner panel). |
| `CHAT_MODEL` / `CHAT_API_KEY`     | dev keys                                                   | prod keys                                               | `google-genai` directo (Gemini AI Studio). Bare model name, sin prefijo. |
| `CHAT_MODEL_B2C` / `CHAT_MODEL_B2B` | opcional (vacío)                                         | opcional (vacío)                                        | Override per-agent. Si está vacío cae a `CHAT_MODEL`. |
| `GEMINI_API_KEY`                  | dev key                                                    | prod key                                                | Embeddings + vision. Sin esto el bot cae a structured-only ranking. |
| `GOOGLE_PLACES_API_KEY`           | dev key                                                    | prod key                                                | Restringir por IP/referrer si se puede. |
| `FAL_KEY`                         | dev key                                                    | prod key                                                | fal.ai. Solo usada por scripts de seed (`seed_review_images.py`, `seed_category_images.py`); no por el API en runtime. |
| `ASYNC_JOB_WORKER_ENABLED`        | `true` (default)                                           | `true` (default)                                        | **Kill switch**. `false` desactiva el worker in-process que drena la cola `async_job` (re-embed/sentiment). Útil si el worker se cuelga y necesitás dejar la API sirviendo sin background jobs. Flip + redeploy. |
| `AGENT_LOOP_CACHE_DISABLED`       | vacío (cache ON)                                           | vacío (cache ON)                                        | **Kill switch**. `1`/`true`/`yes` desactiva el context caching de Gemini en el agent loop del chatbot. Cae a `system_instruction + tools` inline en cada turn. Usar si el caching produce respuestas raras o si Gemini cambia la API. Flip + redeploy. |
| `PORT`                            | no setear (default 8000)                                   | auto-inyectada por Railway                              | `entrypoint.sh` la lee. |
| `UVICORN_WORKERS`                 | `2`                                                        | `2` (subir si Railway escala vertical)                  | Override opcional. |
| `NEXT_PUBLIC_SOCIAL_MOCK`         | `true`                                                     | `false`                                                 | Vive acá porque el front lo lee desde la misma fuente cuando se levanta junto. |

---

## Migraciones (Alembic)

Se corren **en el entrypoint del contenedor**, antes de uvicorn:

```sh
# backend/entrypoint.sh
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers "${UVICORN_WORKERS:-2}"
```

Implicaciones:

- En **dev** cada `docker compose up api` aplica las migraciones nuevas automáticamente.
- En **prod** Railway corre `alembic upgrade head` en cada deploy. Si una migración falla, el contenedor no arranca y Railway lo marca como deploy fallido — la versión vieja sigue sirviendo.
- Para crear una migración nueva: `cd backend && alembic revision --autogenerate -m "descripción"` (correlo contra una DB local con la versión anterior aplicada).
- Para rollback en prod: `alembic downgrade -1` desde el shell de Railway. Considerá el riesgo de pérdida de datos antes.

---

## Snapshot prod → dev

El seed de dev no es un fixture estático sino un dump real de prod tomado en un momento puntual. Esto da consistencia (mismas restaurantes, platos, reseñas que producción) sin depender de prod en tiempo real.

### Tomar un snapshot

Necesitás `pg_dump` (Postgres client tools) y la URL pública del Postgres de Railway.

1. Railway → servicio Postgres → tab **Connect** → **Public Network** → copiar `DATABASE_URL`.
2. Correr:

   ```bash
   pg_dump --no-owner --no-acl --format=custom \
     "postgresql://postgres:<password>@<host>.railway.app:<port>/railway" \
     > backend/scripts/seeds/dev_baseline.dump
   ```

3. El archivo queda en `backend/scripts/seeds/dev_baseline.dump`. Está gitignored (es grande y tiene datos reales).

### Restaurar en dev

```bash
cd backend
docker compose up -d db
./scripts/restore_dev_db.sh
```

El script hace `pg_restore --clean --if-exists` así que se puede correr varias veces sin acumular basura. Después un `docker compose up api` aplica cualquier migración pendiente sobre los datos restaurados.

### Cuándo refrescar

- Después de cambios grandes en prod (migraciones de datos, importaciones de Google Places, etc).
- Cuando un bug local sólo es reproducible con datos reales.
- Antes de hacer una demo en local para que la data esté al día.

### Distribución del dump

El dump **no** se commitea. Si trabaja más de una persona, distribuirlo por canal seguro (Drive privado, 1Password, etc) y tratarlo como dato sensible — contiene emails, hashes de password, etc.

---

## Credenciales: dónde vive cada una

| Credencial                          | Dev                                              | Prod                                                |
|-------------------------------------|--------------------------------------------------|-----------------------------------------------------|
| Frontend keys (`NEXT_PUBLIC_*`)     | `.env.development.local` (gitignored)            | Vercel dashboard                                    |
| Frontend build tokens (Sentry)      | `.env.development.local` (gitignored)            | Vercel dashboard (`SENTRY_AUTH_TOKEN` para source maps) |
| Backend `.env`                      | `backend/.env` (gitignored)                      | Railway dashboard                                   |
| `JWT_SECRET`                        | dev value en `backend/.env`                      | Railway, distinto, rotable                          |
| Postgres user/password              | `backend/.env` (compose lo usa para inicializar) | gestionado por Railway, en la URL `DATABASE_URL`    |
| DB snapshot                         | `backend/scripts/seeds/dev_baseline.dump`        | n/a                                                 |
| Admin user de la app                | `adminpalato@gmail.com / admin123` (en seed)     | mismo (rebrand desde `admin@criticomida.com` a un gmail personal hasta tener inbox en palato.me — entonces migrar a `admin@palato.me`) |

### Rotación

- **`JWT_SECRET` prod**: Railway → Variables → editar. Genera nuevo con `openssl rand -hex 32`. Cambiarlo invalida todos los refresh tokens activos (los usuarios deberán re-loguearse).
- **API keys (fal, gemini, google maps)**: revocar en el dashboard del proveedor, generar nueva, actualizar Railway/Vercel/local. El tráfico se corta entre el momento del revoke y el setting nuevo, así que hacelo en una ventana de baja carga.
- **Postgres prod**: Railway permite resetear la password del servicio. La `DATABASE_URL` se actualiza automáticamente en el servicio api.

---

## Deploys

### Frontend (Vercel)

- Trigger: push a `main` del repo `criticomida_production`.
- Build: `npm run build`. Vercel inyecta las env vars del entorno **Production**.
- Preview deploys: Vercel los crea por cada PR. Las env vars del entorno **Preview** apuntan al mismo backend de Railway (no hay backend de staging por ahora).

### Backend (Railway)

- Trigger: push a `main` del repo `criticomida-backend` (submódulo).
- Build: Docker image desde el `Dockerfile`.
- Run: `entrypoint.sh` → `alembic upgrade head` → `uvicorn`.
- Para que prod del front "vea" un backend nuevo, hay que también pushear el monorepo del front con el bump del puntero del submódulo (`git add backend && git commit && git push`).

### Orden recomendado para releases con migraciones

1. Push al backend submodule → Railway rebuilds y migra.
2. Verificar logs de Railway: `Running alembic upgrade head` → versión nueva → `Starting uvicorn`.
3. Smoke test contra la API de Railway.
4. Push al monorepo con el bump del submódulo → Vercel rebuild del front.
5. Smoke test del front en prod.

Si el orden se invierte, el front nuevo puede pegarle a un backend viejo durante unos minutos. No es catastrófico (solo errores) pero conviene evitarlo.

---

## Troubleshooting

| Síntoma                                                | Causa probable                                       | Fix |
|--------------------------------------------------------|------------------------------------------------------|-----|
| `docker compose up api` falla con `alembic: ...`       | Migración rota o conflicto de heads                  | `cd backend && alembic heads`; resolver conflicto antes de `up`. |
| Front muestra fallback data en lugar de la real        | Backend caído o `NEXT_PUBLIC_API_URL` apunta mal     | `curl localhost:8002/restaurants?limit=1`; revisar `.env.development.local`. |
| 401s en loop después de rotar `JWT_SECRET`             | Refresh tokens viejos firmados con el secret anterior | Es esperado, el usuario debe re-loguearse. |
| Railway deploy falla en `alembic upgrade head`         | Migración requiere data manual o falta una columna    | Logs de Railway → fixear migración → push de nuevo. La versión vieja sigue sirviendo. |
| Vercel build OK pero la app crashea con `fetch failed` | `NEXT_PUBLIC_API_URL` no setead o con typo            | Vercel → Project → Settings → Environment Variables. |
| Costo de Gemini desbocado en el chatbot                | Context caching mal aplicado o bug en cache reuse    | `AGENT_LOOP_CACHE_DISABLED=1` en Railway + redeploy. Vuelve a inline prompts (más caro per-turn pero sin caché). |
| `async_job` worker cuelga la API o consume CPU         | Worker in-process atascado en un re-embed/sentiment   | `ASYNC_JOB_WORKER_ENABLED=false` en Railway + redeploy. La API sigue sirviendo; los jobs se acumulan hasta que se reactive. |

---

## Observabilidad (Sentry)

### Wiring actual

| Runtime           | Archivo                                                | Notas |
|-------------------|--------------------------------------------------------|-------|
| FE — browser      | `instrumentation-client.ts`                            | Canonical en `@sentry/nextjs` v8+. Auto-detectado por nombre. `sentry.client.config.ts` (v7 legacy) está deliberadamente **ausente**. |
| FE — server/edge  | `instrumentation.ts` → `sentry.{server,edge}.config.ts` | Dispatcher por `NEXT_RUNTIME`. |
| FE — build        | `withSentryConfig(...)` en `next.config.ts`             | Sube source maps. `tunnelRoute: '/monitoring'` evita ad-blockers. |
| Backend           | `app/main.py` (`sentry_sdk.init`)                       | Trazas con `SENTRY_TRACES_SAMPLE_RATE`. |

### Smoke-test de que los eventos llegan al dashboard

Antes de promover a prod (o después de cambios en cualquier `sentry.*config.ts` / `instrumentation*.ts`):

1. **FE — browser**: en una preview de Vercel, abrí DevTools → Console y tipeá:
   ```js
   throw new Error('sentry-smoke-fe-browser')
   ```
   En el dashboard de Sentry → Issues, debería aparecer el evento con tag `environment=preview` en < 30s. Verificá que el stack trace está **deminified** (eso prueba que el source map upload funcionó).
2. **FE — server**: en una preview, navegá a una ruta que tire un error en RSC. En el dashboard debe aparecer con `runtime: nodejs`.
3. **Backend**: desde un endpoint protegido (e.g. `/api/admin/...`), tirá una excepción a mano vía un script o curl + un endpoint de test. Aparece con `environment=production` y los breadcrumbs del request.
4. **User context** (FE): logueate en la app, dispará un error, y confirmá que el evento trae `user.id` + `user.handle` (lo setea `AuthContext.syncSentryUser`).

Si algo no aparece, ver Troubleshooting de arriba o revisar el output del build de Vercel: tiene que decir `Sentry: Successfully uploaded source maps`.

---

## Runbook — Migración a dominio propio (`palato.me` / `api.palato.me`)

**Por qué:** con el front en `*.vercel.app` y el backend en `*.up.railway.app`
(dominios registrables distintos), las cookies de auth son *third-party*. Safari
las bloquea siempre; Chrome/Firefox las bloquean o particionan. Síntoma: el
usuario se desloguea con un solo F5 apenas caduca el access token (~15 min),
sin concurrencia de por medio. Con front y API bajo el mismo site (`palato.me`)
las cookies pasan a ser first-party y persisten los 7 días del refresh token.

**No requiere cambios de código** (el `SameSite=None; Secure` actual ya sirve
una vez que es same-site). Es config de dashboards + DNS + env.

### Pasos (en orden)

1. **Railway — custom domain del backend**
   - Service `api` → Settings → Networking → Custom Domain → `api.palato.me`.
   - Railway da un target CNAME (algo como `xxxx.up.railway.app`).
   - En el DNS de `palato.me`: `CNAME  api  →  <target de Railway>`.
   - Esperá a que Railway marque el dominio *Active* (TLS emitido).
2. **Vercel — custom domain del frontend**
   - Project → Settings → Domains → agregar `palato.me` (y `www.palato.me`).
   - Seguí las instrucciones de DNS de Vercel (`A`/`ALIAS` para el apex,
     `CNAME` para `www`).
   - Marcá `palato.me` como **Production / primary domain**: así
     `criticomida-production.vercel.app` redirige (308) al dominio propio y
     nadie queda en el host viejo (que volvería a romper las cookies).
3. **Vercel — env vars (Production)**
   - `NEXT_PUBLIC_API_URL = https://api.palato.me`
   - Redeploy del frontend (las `NEXT_PUBLIC_*` se hornean en build).
4. **Railway — env vars (service api)**
   - `CORS_ORIGINS = https://palato.me` (agregá `https://www.palato.me` solo
     si `www` no redirige al apex; lo ideal es que redirija y dejar solo el
     apex).
   - `PUBLIC_APP_URL = https://palato.me`
   - `COOKIE_SECURE = true`, `APP_ENV = production` (deben seguir así).
   - Redeploy del backend.
5. **DNS de Google Maps key**: si `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` está
   restringida por referrer, agregá `https://palato.me/*` a la allowlist.

### Post-checks (hacelos sí o sí)

- `curl -I https://api.palato.me/health` → 200 y TLS válido.
- En `https://palato.me`, DevTools → Application → Cookies: tras login,
  `access_token` y `refresh_token` aparecen con domain `api.palato.me`,
  `Secure`, `SameSite=None`, `HttpOnly`.
- Login → esperá > 15 min (o borrá la cookie `access_token` a mano) → F5.
  Debe **seguir logueado** (el `/api/auth/refresh` ahora sí lleva la cookie).
- Safari específicamente (es el más estricto): repetir el test anterior.
- DevTools → Network en `/api/auth/refresh`: request con `Cookie: refresh_token=…`
  y response 200 con nuevos `Set-Cookie`.

### Rollback

Volver `NEXT_PUBLIC_API_URL` a la URL de Railway y `CORS_ORIGINS` al dominio
`*.vercel.app`, redeploy ambos. Vuelve el bug de cookies de terceros pero la
app funciona; usar solo si el dominio propio quedó mal configurado.

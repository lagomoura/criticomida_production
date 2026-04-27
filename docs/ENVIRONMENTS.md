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
│  Vercel (Next.js)                                        │
│      │                                                   │
│      ▼  https://criticomida-backend-production.up.railway.app
│  Railway: criticomida-backend-production                 │
│   ├── service api  Dockerfile + entrypoint.sh            │
│   └── service postgres  managed, separado de dev         │
└──────────────────────────────────────────────────────────┘
```

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
| `NEXT_PUBLIC_API_URL`             | `http://localhost:8002`                  | `https://criticomida-backend-production.up.railway.app`       | Browser-exposed. |
| `NEXT_PUBLIC_SOCIAL_MOCK`         | `true`                                   | `false`                                                       | Cuando es `true` la UI de feed usa mocks. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | dev key                                  | prod key                                                      | Browser-exposed. Restringir por dominio en Google Cloud. |
| `FAL_KEY`                         | dev key                                  | prod key                                                      | Server-side. fal.ai. |
| `CHAT_MODEL`                      | `gemini/gemini-2.5-flash`                | igual                                                         | Modelo de litellm. |
| `CHAT_API_KEY`                    | dev key                                  | prod key                                                      | Server-side. |

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
| `JWT_ISSUER` / `JWT_AUDIENCE`     | `criticomida-api` / `criticomida-clients`                  | igual                                                   |       |
| `ACCESS_TOKEN_EXPIRE_MINUTES`     | `30` (cómodo en dev)                                       | `15`                                                    | Más corto en prod. |
| `REFRESH_TOKEN_EXPIRE_DAYS`       | `7`                                                        | `7`                                                     |       |
| `APP_ENV`                         | `development`                                              | `production`                                            |       |
| `COOKIE_SECURE`                   | `false`                                                    | `true`                                                  | `Secure` cookies requieren HTTPS — sólo prod. |
| `CORS_ORIGINS`                    | `http://localhost:3000,...`                                | `https://<vercel-app>.vercel.app`                       | Coma-separado. |
| `CHAT_MODEL` / `CHAT_API_KEY`     | dev keys                                                   | prod keys                                               | litellm. |
| `GOOGLE_PLACES_API_KEY`           | dev key                                                    | prod key                                                | Restringir por IP/referrer si se puede. |
| `FAL_KEY`                         | dev key                                                    | prod key                                                | fal.ai. |
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
| Frontend server keys (fal, gemini)  | `.env.development.local` (gitignored)            | Vercel dashboard                                    |
| Backend `.env`                      | `backend/.env` (gitignored)                      | Railway dashboard                                   |
| `JWT_SECRET`                        | dev value en `backend/.env`                      | Railway, distinto, rotable                          |
| Postgres user/password              | `backend/.env` (compose lo usa para inicializar) | gestionado por Railway, en la URL `DATABASE_URL`    |
| DB snapshot                         | `backend/scripts/seeds/dev_baseline.dump`        | n/a                                                 |
| Admin user de la app                | `admin@criticomida.com / admin123` (en seed)     | mismo si viene del snapshot — **rotar si querés**   |

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

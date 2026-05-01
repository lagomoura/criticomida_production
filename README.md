# CritiComida

Plataforma de reseñas gastronómicas centradas en el plato. Frontend en Next.js 15 (App Router) con backend FastAPI en submódulo (`backend/`, repo separado).

## Stack

| Capa     | Dev (local)                | Prod                                                      |
|----------|----------------------------|-----------------------------------------------------------|
| Frontend | `npm run dev` en host      | [Vercel](https://vercel.com)                              |
| Backend  | `docker compose up`        | [Railway](https://railway.app)                            |
| DB       | Postgres 16 en Docker      | Railway managed Postgres (separada de dev)                |

Las dos bases de datos nunca se conectan. El único puente es un snapshot manual `pg_dump prod → restore local` cuando dev quiere refrescar el baseline.

## Quickstart

Requisitos: Node 20+, Docker, `pg_dump`/`pg_restore` (cliente Postgres) si vas a refrescar el snapshot.

```bash
# 1. Backend + DB en Docker
cd backend
cp .env.example .env                      # ajustá secretos si los rotaste
docker compose up -d db
./scripts/restore_dev_db.sh               # carga el snapshot (ver "Snapshot")
docker compose up api                     # corre alembic + uvicorn

# 2. Frontend (en otra terminal, desde la raíz)
cp .env.example .env.development.local    # pegá tus keys
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Comandos útiles

```bash
npm run dev          # Next dev server
npm run dev:clean    # Wipe .next cache + dev
npm run build        # Production build
npm run lint         # ESLint
npm run test:backend # pytest en el submódulo backend/
```

## Snapshot prod → dev

`backend/scripts/restore_dev_db.sh` espera el dump en `backend/scripts/seeds/dev_baseline.dump` (gitignored). Para generarlo:

```bash
pg_dump --no-owner --no-acl --format=custom \
  "<RAILWAY_PUBLIC_DATABASE_URL>" \
  > backend/scripts/seeds/dev_baseline.dump
```

La URL pública del Postgres de Railway se saca desde **Railway → Postgres service → Connect → Public Network**.

## Documentación

- **[docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md)** — tabla completa de variables de entorno, qué credenciales viven dónde, cómo se hacen los deploys.
- **[CLAUDE.md](CLAUDE.md)** — guía rápida para agentes y para vos cuando volvés al repo después de un rato.
- **[docs/brand-identity-v2.md](docs/brand-identity-v2.md)** — paleta y tipografía vigentes.
- **[docs/criticomida-social-product-spec-v1.md](docs/criticomida-social-product-spec-v1.md)** — spec del producto social.

## Deploy

Push a `main` dispara los deploys:

- **Frontend (este repo)** → Vercel rebuild.
- **Backend (submódulo `backend/`, repo `criticomida-backend`)** → Railway rebuild. El `entrypoint.sh` corre `alembic upgrade head` antes de uvicorn, así que las migraciones se aplican en automático en cada deploy.

Para que prod use el último backend, después de pushear el submódulo hay que también pushear el monorepo con el bump del puntero.

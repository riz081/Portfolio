# Portfolio — Dinamis + CMS

Portfolio pribadi dengan backend CMS (Go + Echo). Konten dikelola lewat dashboard admin, disimpan di PostgreSQL, media di S3/MinIO.

## Struktur

```
frontend/   React 19 + Vite (situs publik + dashboard /admin)
backend/    Go + Echo (+ GORM + PostgreSQL + MinIO/S3)
scripts/    export-cms-data.cjs (konversi data lama → JSON seed)
```

## Prasyarat

- Node.js 20+
- Go 1.22+
- Docker + Docker Compose (untuk PostgreSQL & MinIO)

## Menjalankan (development)

### 1. Nyalakan database & object storage

```bash
docker compose up -d postgres minio
```

Daftar port host (hindari bentrok dengan service lokal):

| Service | Host port |
|---|---|
| PostgreSQL | 5435 |
| MinIO API | 9010 |
| MinIO Console | 9011 |

Override via env: `POSTGRES_PORT`, `MINIO_PORT`, `MINIO_CONSOLE_PORT`.

### 2. Backend

```bash
cd backend
# salin contoh env bila perlu
# (nilai default di config.go sudah cukup untuk dev)

exec env \
  DB_HOST=localhost DB_PORT=5435 DB_USER=portfolio DB_PASSWORD=portfolio DB_NAME=portfolio \
  S3_ENDPOINT=localhost:9010 S3_ACCESS_KEY=minioadmin S3_SECRET_KEY=minioadmin S3_BUCKET=portfolio \
  S3_PUBLIC_URL=http://localhost:9010/portfolio \
  JWT_SECRET=devsecret ADMIN_USER=admin ADMIN_PASS=admin123 \
  go run ./cmd/server
```

Backend jalan di `http://localhost:9998`.

### 3. Migrasi data lama (seed, opsional)

```bash
cd backend
DB_HOST=localhost DB_PORT=5435 DB_USER=portfolio DB_PASSWORD=portfolio DB_NAME=portfolio \
SEED_FILE=seed/data.json go run ./cmd/seed
```

> Regenerate `seed/data.json` dari `frontend/src/data/constants.jsx`:
> `node scripts/export-cms-data.cjs`

### 4. Frontend

```bash
cd frontend
cp .env.example .env   # isi EmailJS
npm install
npm run dev            # http://localhost:9999 (proxy /api → :9998)
```

Dashboard admin: `http://localhost:9999/admin` (login `admin` / `admin123`).

## Production (VPS + Docker)

```bash
cp .env.example .env    # isi JWT_SECRET, ADMIN_*, S3_*
docker compose up -d --build
```

- Frontend (nginx): `:9999`
- Backend: `:9998`
- PostgreSQL / MinIO: internal network

## API

Lihat `/Users/<kamu>/.opencode/plan/API-Contract.md` untuk spesifikasi lengkap endpoint & payload.

Ringkas:

- `GET /api/v1/portfolio` — aggregat semua konten (1 request).
- `GET /api/v1/{projects,experiences,education,skills,bio}` — publik.
- `POST /api/v1/admin/auth/login` — login (JWT via httpOnly cookie).
- `*/api/v1/admin/*` — CRUD (butuh auth).
- `POST /api/v1/admin/upload` — upload gambar → S3/MinIO → URL.

## Dokumen perencanaan

- PRD, SDD, PDD, API Contract — di `.opencode/plan/`.
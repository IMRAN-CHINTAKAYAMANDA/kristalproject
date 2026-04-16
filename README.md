# Military Asset Management System

Full-stack React and Node.js application for tracking military assets across bases.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: SQLite via `sql.js`

## Run Locally

Install dependencies:

```bash
npm install
npm --prefix backend install
```

Start the backend:

```bash
npm run backend:5050
```

Start the frontend:

```bash
npm run dev:5050
```

Open:

```text
http://localhost:5173
```

## Demo Logins

All demo users use password `password`.

```text
admin      - Admin
commander  - Base Commander
logistics  - Logistics Officer
```

## API

The backend runs on `http://localhost:5050` when using the scripts above.

- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `GET /api/meta`
- `GET /api/dashboard`
- `GET /api/purchases`
- `POST /api/purchases`
- `GET /api/transfers`
- `POST /api/transfers`
- `GET /api/assignments`
- `POST /api/assignments`
- `GET /api/expenditures`
- `POST /api/expenditures`
- `GET /api/users`
- `POST /api/users`

## RBAC

- Admin: all pages and all API endpoints.
- Base Commander: dashboard, transfers, assignments, expenditures for accessible base data.
- Logistics Officer: dashboard, purchases, transfers, assignments, expenditures for accessible base data.

SQLite data is generated at `backend/data/assets.sqlite` and ignored by Git.

## Deployment

### Backend on Render

Use the repository's `render.yaml` Blueprint.

1. Go to Render.
2. New > Blueprint.
3. Connect this GitHub repo.
4. Select the `main` branch.
5. Deploy the `kristalproject-api` service.

The backend URL will look like:

```text
https://kristalproject-api.onrender.com
```

Health check:

```text
https://kristalproject-api.onrender.com/api/health
```

The included Render blueprint uses the free plan, so SQLite data is stored on Render's ephemeral filesystem and can reset when the service restarts. For persistent production data, upgrade the Render service and attach a disk, then set `DB_PATH=/var/data/assets.sqlite`.

### Frontend on Vercel

1. Go to Vercel.
2. Add New > Project.
3. Import this GitHub repo.
4. Framework Preset: Vite.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add Environment Variable:

```text
VITE_API_URL=https://kristalproject-api.onrender.com
```

8. Deploy.

If Render gives a different backend URL, use that exact URL for `VITE_API_URL`.

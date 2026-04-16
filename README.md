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

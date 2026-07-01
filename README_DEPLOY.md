# Deployment and Production Setup

## Render Backend

This backend is intended to run on Render with PostgreSQL.

### Required environment variables

- `DATABASE_URL` - PostgreSQL connection string, from Render database.
- `ADMIN_USER` - admin username for the login endpoint.
- `ADMIN_PASS` - admin password for the login endpoint.

### Render service settings

- Build Command: `npm install`
- Start Command: `npm run start`
- Root Directory: `theomprajapati.com-api`
- Health Check Path: `/health`

### Local development

Use PostgreSQL locally or via Render. Set `.env` to a local Postgres connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/theomprajapati"
ADMIN_USER=admin
ADMIN_PASS=password
```

Then run:

```bash
cd theomprajapati.com-api
npm install
npx prisma migrate dev --name local_dev
npm run seed
npm run dev
```

If you do not have local PostgreSQL installed, deploy the backend to Render and use the Render database instead.

## Vercel Frontends

For both frontend projects, set:

- `VITE_API_BASE_URL=https://api.theomprajapati.com`

### `theomprajapati.com`

No extra config is required aside from `vercel.json` rewrite.

### `theomprajapati.com-admin`

No extra config is required aside from `vercel.json` rewrite.

## Production Flow

1. Backend on Render with PostgreSQL database.
2. Frontend and admin on Vercel using the API base URL above.
3. Admin login works through `POST /admin/login`.

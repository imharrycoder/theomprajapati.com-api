# Deployment and Production Setup

## Render Backend

This backend currently uses the checked-in SQLite Prisma schema and migrations.

### Required environment variables

- `DATABASE_URL` - SQLite connection string, for example `file:./dev.db`.
- `ADMIN_USER` - admin username for the login endpoint.
- `ADMIN_PASS` - admin password for the login endpoint.

### Render service settings

- Build Command: `npm install`
- Start Command: `npm run start`
- Root Directory: `theomprajapati.com-api`
- Health Check Path: `/health`

### Local development

Set `.env.local` to a local SQLite connection string:

```
DATABASE_URL="file:./dev.db"
ADMIN_USER=admin
ADMIN_PASS=password
```

Then run:

```bash
cd theomprajapati.com-api
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

If you switch this project to PostgreSQL later, update `prisma/schema.prisma`, regenerate the migrations for PostgreSQL, and then use a PostgreSQL `DATABASE_URL`.

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

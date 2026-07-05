---
name: next-financial-database
description: Access and maintain the Next Financial PostgreSQL database via Prisma 7 scripts and CLI. Use when debugging login, listing users, resetting passwords, running seeds, backups, or migrations for this project.
---

# Next Financial Database Access

## Prerequisites

- `.env` in project root with `DATABASE_URL` and `AUTH_SECRET`
- Docker Postgres running: `docker compose -f devops/compose.yml up -d`
- Prisma client generated: `yarn prisma generate`

## Safety (production)

1. **Back up first:** `yarn db:backup`
2. **Never** run `yarn db:push` or `prisma migrate reset` on production
3. Migrations: `yarn db:migrate` only (applies pending SQL, preserves data)

## Common commands

| Task | Command |
|------|---------|
| List users | `yarn db:users` or `yarn db:users admin` |
| Reset admin password | `yarn db:reset-admin` |
| Reset specific user | `node scripts/reset-admin-password.js user@example.com newpass` |
| Seed admin (if missing) | `yarn seed` |
| Backup | `yarn db:backup` |
| Apply migrations | `yarn db:migrate` |

## Default admin credentials

After `yarn db:reset-admin` or fresh seed:

- Email: `admin@example.com` (or `ADMIN_EMAIL` in `.env`)
- Password: `admin123` (or `ADMIN_PASSWORD` in `.env`)

## Schema vs database mismatch

If login fails with \"Email not found\" but the user exists, check column names with `yarn db:users admin`.

Common cause: Prisma schema field names out of sync with DB columns. Migration `20240704120000_fix_naming_typos` renames `cartNumber` → `cardNumber`, `payedAt` → `paidAt`, `descriptiion` → `description`. Apply after backup:

```bash
yarn db:backup && yarn db:migrate && yarn prisma generate
```

**Status:** This migration is applied; schema no longer uses `@map` for those columns.

## Login troubleshooting
2. Check: user exists, `role` is `ADMIN` for dashboard, `deletedAt` is null
3. Reset password: `yarn db:reset-admin`
4. Verify app env: `AUTH_SECRET` set (32+ chars in production), `secure` cookies work on HTTPS only in production
5. Admin redirect goes to `/dashboard`; non-admin goes to `/`

## Script architecture

- `scripts/lib/prisma-cli.js` — Prisma 7 client with `@prisma/adapter-pg` (loads `.env`)
- `scripts/db-list-users.js` — query users
- `scripts/reset-admin-password.js` — create/update admin + password hash
- `scripts/backup-db.sh` — `pg_dump` (strips `?schema=` from URL for pg tools)

## Raw SQL (optional)

Strip Prisma query params from URL:

```bash
source .env
PG_URL="${DATABASE_URL%%\?*}"
psql "$PG_URL" -c 'SELECT id, email, role, "deletedAt" FROM "User";'
```

Or via Docker:

```bash
docker exec -it financial-postgres-dev psql -U postgres -d financial \
  -c 'SELECT id, email, role, "deletedAt" FROM "User";'
```

## Prisma 7 notes

- App uses `prisma/database/prisma.ts` with `PrismaPg` adapter
- Standalone scripts must use `scripts/lib/prisma-cli.js`, not bare `new PrismaClient()`
- Config: `prisma.config.ts` (not `url` in schema.prisma)

# Next Financial

Financial management application for accounts, loans, installments, and payments. Built with Next.js App Router, Prisma, PostgreSQL, and Mantine UI.

## Prerequisites

- Node.js 20+
- Yarn 1.x
- Docker (for local PostgreSQL)

## Setup (local development)

1. Start PostgreSQL:

```bash
docker compose -f devops/compose.yml up -d
```

2. Copy environment variables:

```bash
cp .env.example .env
```

Update `.env` with your local `DATABASE_URL` and a strong `AUTH_SECRET` (32+ characters).

3. Install dependencies:

```bash
yarn install
```

4. Apply migrations (local database only):

```bash
yarn db:migrate
```

5. Seed the admin user (optional, local only):

```bash
yarn seed
```

Default admin credentials (from `prisma/seed.js`):

- Email: `admin@example.com` (or `ADMIN_EMAIL` from `.env`)
- Password: `admin123` (or `ADMIN_PASSWORD` from `.env`)

6. Start the dev server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production database — important

**Back up before any migration or schema change:**

```bash
yarn db:backup
```

Dumps are saved to `backups/financial_YYYYMMDD_HHMMSS.dump` (gitignored). Requires `pg_dump` in your PATH (`brew install libpq` on macOS).

**Do not use `yarn db:push` on production.** It can alter schema outside of migrations.

To apply pending migrations on production (including column renames that **preserve all existing data**):

```bash
yarn db:migrate
```

The migration `20240704120000_fix_naming_typos` only runs `RENAME COLUMN` operations — no tables or rows are dropped. Still recommended:

1. Take a database backup before migrating production
2. Run during a low-traffic window
3. Verify the app after migration

Never run `prisma migrate reset` on production.

## Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Generate Prisma client and build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn tsc --noEmit` | Type-check without emitting files |
| `yarn test` | Run unit tests (Vitest) |
| `yarn format` | Format code with Prettier |
| `yarn format:check` | Check formatting |
| `yarn db:backup` | Backup PostgreSQL to `backups/` (run before any DB change) |
| `yarn db:migrate` | Apply pending migrations (`prisma migrate deploy`) |
| `yarn db:push` | Push schema to DB — **dev only, not for production** |
| `yarn db:users [search]` | List users (optional email/name filter) |
| `yarn db:reset-admin [email] [password]` | Reset a user's password (default: `admin@example.com` / `admin123`) |
| `yarn seed` | Create default admin user if missing |

## User panel (web + Telegram Mini App)

Member-facing UI lives under `src/app/(user-application)/` with Tailwind + shadcn (scoped via `#user-app`). Admin dashboard remains Mantine.

**Routes:** `/home`, `/accounts`, `/loans`, `/installments`, `/payments`, `/profile`, `/more`

**Auth:**
- Members: email/password at `/login` → `/home`
- Admins: email/password at `/dashboard/login` → `/dashboard`
- Telegram Mini App: `POST /api/auth/telegram` with `Authorization: tma <initData>`

**Telegram setup:**
1. Create a bot via [BotFather](https://t.me/BotFather)
2. Set Mini App URL to your production `/home`
3. Add `TELEGRAM_BOT_TOKEN` and `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` to `.env`
4. Admin links each member's Telegram ID in **Dashboard → Users → Edit** (or pick from **Dashboard → Telegram**)

### Telegram group members (admin)

Telegram bots **cannot list every group member** via API. This app stores members when they:

- Are synced as **administrators** (Sync administrators button)
- **Post** in the group (webhook)
- **Join** the group (`chat_member` updates via webhook)

1. Add `TELEGRAM_GROUP_CHAT_ID` to `.env` (negative number for supergroups; use @RawDataBot on a forwarded group message)
2. Optional: `TELEGRAM_WEBHOOK_SECRET` for webhook verification
3. Run `yarn db:migrate` (adds `TelegramGroupMember` table)
4. Open **Dashboard → Telegram** → **Sync administrators**
5. For ongoing capture, click **Register webhook** (requires a public HTTPS URL, e.g. production or ngrok)
6. Link members on **Users → Edit** via the **Link Telegram member** dropdown

Unlinked Telegram users see `/link-required`.

## Tech stack

- Next.js 16, React 19
- Prisma 7 with `@prisma/adapter-pg`
- PostgreSQL
- Mantine 9 (admin dashboard)
- Tailwind CSS 4 + shadcn-style components (user panel)
- `@telegram-apps/init-data-node` (Mini App auth)
- Zod 4, React Hook Form
- Jose (JWT sessions)

## Project structure

```
src/app/              # Next.js App Router pages and UI
prisma/
  schema.prisma       # Database schema
  migrations/         # Versioned SQL migrations
  database/           # Server actions and data access
  seed.js             # Admin user seeder
devops/compose.yml    # Local PostgreSQL via Docker
```

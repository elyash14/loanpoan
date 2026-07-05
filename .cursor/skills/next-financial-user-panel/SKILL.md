---
name: next-financial-user-panel
description: User-facing panel for Next Financial (web + Telegram Mini App). Use when building routes under (user-application), Telegram auth, user-scoped data, or shadcn/Tailwind user UI.
---

# Next Financial User Panel

## Routes (URLs omit route group)

| Route | Purpose |
|-------|---------|
| `/home` | Personal overview + abstract system stats |
| `/accounts`, `/accounts/[id]` | User's accounts only |
| `/loans`, `/loans/[id]` | User's loans only |
| `/installments` | User's installments |
| `/payments` | User's loan payments |
| `/profile` | Own profile + change password |
| `/link-required` | Telegram user not linked by admin |
| `/login` | Email/password (web) |

Admin panel stays at `/dashboard/*` (Mantine). User panel uses Tailwind + shadcn under `#user-app`.

## Auth

- **Web:** email/password → JWT session cookie (existing `createSession`)
- **Telegram:** `POST /api/auth/telegram` with `Authorization: tma <initData>`
  - Validate HMAC with `TELEGRAM_BOT_TOKEN`
  - Lookup `User` by `telegramId` (admin must link in dashboard)
  - `403 NOT_LINKED` if no match

## Data access rule

**Never** query financial data without `session.userId` from server session.

Use `prisma/database/user-panel/data.ts` — all functions require `userId` as first argument.

Detail pages: `getUserAccountIfOwned`, `getUserLoanIfOwned` — `notFound()` if not owned.

## Telegram linking (admin workflow)

1. Add bot to group
2. User opens Mini App once (or admin gets their Telegram numeric ID)
3. Admin sets `telegramId` + optional `telegramUsername` on user edit form
4. User reopens Mini App → auto login

## Env

- `TELEGRAM_BOT_TOKEN` — BotFather token (server only)
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — bot username for widget/docs

## UI stack

- User app: Tailwind scoped with `important: '#user-app'`, shadcn in `(user-application)/components/ui/`
- Admin: Mantine — do not mix into user pages

## Packages

- `@telegram-apps/sdk-react`, `@telegram-apps/init-data-node`
- `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`

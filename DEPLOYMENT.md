# Deployment Guide

A brief guide to deploy **PayLoop** using Docker (ideal for Coolify or custom Docker setups).

## Requirements

1. **PostgreSQL Database**: Already set up and accessible.
2. **Docker Environment** (like Coolify, CapRover, or Portainer) pointing to your port `3000`.
3. **Telegram Bot & Mini App** configured via BotFather (optional).

---

## Coolify / Single Container Deployment

When deploying on **Coolify**:

1. Point Coolify to your Git repository.
2. Choose **Dockerfile** as the Build Pack.
3. Configure the following environment variables in Coolify's Environment settings:

### Environment Variables

- `DATABASE_URL`: Connection string to your existing PostgreSQL database (e.g. `postgresql://user:password@host:5432/db?schema=public`).
- `AUTH_SECRET`: Generate a secure 32-character string.
- `NEXT_PUBLIC_APP_URL`: Your public production URL (e.g., `https://financial.yourdomain.com`).
- `CRON_SECRET`: Secure string for authorizing cron requests.
- Telegram credentials:
  - `TELEGRAM_BOT_TOKEN`
  - `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
  - `NEXT_PUBLIC_TELEGRAM_MINI_APP_SHORT_NAME`
  - `TELEGRAM_GROUP_CHAT_ID`
  - `TELEGRAM_PAYMENTS_TOPIC_ID`
  - `TELEGRAM_WEBHOOK_SECRET`

---

## Startup and Migrations

The container's `entrypoint.sh` automatically runs the database migrations (`prisma migrate deploy`) on startup before launching the Next.js production server.

### Database Seeding (First-time setup only)
To seed initial configurations and categories into your database, execute the seed command inside your running container (Coolify terminal or manual Docker CLI):
```bash
npx prisma db seed
```
*(Or use `yarn seed` from within the container's shell)*

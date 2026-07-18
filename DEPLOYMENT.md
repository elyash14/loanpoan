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
- `UPLOADS_DIR` (optional): Absolute path for runtime uploads. Default in the image is `/app/uploads`.

---

## Persistent avatar uploads (required)

Avatars are stored on disk under `UPLOADS_DIR` (default `/app/uploads`) and served by `/api/avatars/...`.

**Without a volume, every redeploy wipes uploaded photos** (the database still has the URL, but the file is gone).

### Coolify

1. Open your PayLoop application → **Persistent Storage** (or **Storages**).
2. Add a volume:
   - **Name:** `payloop-uploads` (any name)
   - **Destination path (container):** `/app/uploads`
3. Save and **redeploy**.
4. In the Mini App, **upload the avatar again** once (old files from before this volume will not exist).

Optional env (usually not needed; already set in the Docker image):

```env
UPLOADS_DIR=/app/uploads
```

### Docker Compose

See `devops/compose.app.example.yml` — it mounts `payloop_uploads:/app/uploads`.

```bash
docker compose -f devops/compose.app.example.yml up -d --build
```

---

## Cron: Daily Installment Generation

The production image only runs the Next.js server. It does **not** start `scripts/cron-worker.js`. Use **Coolify Scheduled Tasks** to call the cron API once a day.

### Coolify Scheduled Task

1. Open Coolify → your **payloop** application → **Scheduled Tasks**.
2. Add a new task:
   - **Name:** `generate-installments`
   - **Frequency:** `0 1 * * *` (every day at 1:00 AM server time)
   - **Command:**

```bash
wget -qO- --method=POST --header="Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/generate-installments
```

If `wget` is not available in the container, use:

```bash
curl -sS -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/generate-installments
```

3. Make sure `CRON_SECRET` is set in the app Environment variables (same value used by the API route).
4. Save and enable the task.

### How to verify

- In Coolify → **Scheduled Tasks**, check the last run status after the next scheduled time (or run the task manually if Coolify allows it).
- Or call the endpoint once from the container terminal:

```bash
wget -qO- --method=POST --header="Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/generate-installments
```

A successful run returns HTTP 200 and generates installments for due loans.

---

## Startup and Migrations

The container's `entrypoint.sh` automatically runs the database migrations (`prisma migrate deploy`) on startup before launching the Next.js production server.

### Database Seeding (First-time setup only)
To seed initial configurations and categories into your database, execute the seed command inside your running container (Coolify terminal or manual Docker CLI):
```bash
npx prisma db seed
```
*(Or use `yarn seed` from within the container's shell)*

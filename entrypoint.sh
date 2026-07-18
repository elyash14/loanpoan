#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

UPLOADS_ROOT="${UPLOADS_DIR:-./uploads}"

# Coolify/Docker volumes are often mounted as root. Fix ownership, then drop to nextjs.
if [ "$(id -u)" = "0" ]; then
  echo "Preparing uploads directory as root..."
  mkdir -p "${UPLOADS_ROOT}/avatars" ./public/uploads/avatars
  chown -R nextjs:nodejs "${UPLOADS_ROOT}" ./public/uploads
  echo "Uploads directory ready: ${UPLOADS_ROOT}"
  exec su-exec nextjs "$0" "$@"
fi

echo "Starting deployment checks and initialization..."
mkdir -p "${UPLOADS_ROOT}/avatars" ./public/uploads/avatars

# Run database migrations
if [ -d "./prisma" ]; then
  echo "Applying database migrations..."
  # prisma.config.ts resolves `prisma/config` from /app — point Node at the CLI install
  NODE_PATH=/opt/prisma/node_modules \
    /opt/prisma/node_modules/.bin/prisma migrate deploy
  echo "Database migrations applied successfully."
else
  echo "No prisma directory found, skipping migrations."
fi

echo "Starting Next.js production server..."
exec node server.js

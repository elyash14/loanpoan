#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting deployment checks and initialization..."

UPLOADS_ROOT="${UPLOADS_DIR:-./uploads}"
mkdir -p "${UPLOADS_ROOT}/avatars" ./public/uploads/avatars
echo "Uploads directory ready: ${UPLOADS_ROOT}"

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

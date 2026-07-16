#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting deployment checks and initialization..."

# Run database migrations
if [ -d "./prisma" ]; then
  echo "Applying database migrations..."
  prisma migrate deploy
  echo "Database migrations applied successfully."
else
  echo "No prisma directory found, skipping migrations."
fi

echo "Starting Next.js production server..."
exec node server.js

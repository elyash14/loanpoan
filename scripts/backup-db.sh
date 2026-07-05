#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"

load_env() {
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
  fi
}

require_database_url() {
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "Error: DATABASE_URL is not set."
    echo "Set it in .env or export it before running this script."
    exit 1
  fi
}

ensure_pg_dump() {
  if command -v pg_dump >/dev/null 2>&1; then
    return 0
  fi

  echo "Error: pg_dump was not found in PATH."
  echo "Install PostgreSQL client tools, e.g.: brew install libpq && brew link --force libpq"
  exit 1
}

main() {
  load_env
  require_database_url
  ensure_pg_dump

  mkdir -p "$BACKUP_DIR"

  local timestamp
  timestamp="$(date +"%Y%m%d_%H%M%S")"
  local backup_file="$BACKUP_DIR/financial_${timestamp}.dump"

  echo "Backing up database..."
  echo "Output: $backup_file"

  # pg_dump does not accept Prisma's ?schema= query param
  local pg_url="${DATABASE_URL%%\?*}"

  pg_dump "$pg_url" \
    --schema=public \
    --format=custom \
    --no-owner \
    --no-privileges \
    --file="$backup_file"

  local size
  size="$(du -h "$backup_file" | cut -f1)"

  echo "Backup completed successfully ($size)."
  echo
  echo "To restore later (overwrites target DB objects — use with care):"
  echo "  pg_restore --clean --if-exists --no-owner --no-privileges --dbname=\"\$DATABASE_URL\" \"$backup_file\""
}

main "$@"

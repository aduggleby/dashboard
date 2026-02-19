#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but not installed." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose is required but not available." >&2
  exit 1
fi

mkdir -p data

echo "Starting dashboard dev container on http://localhost:8080"
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

echo "Dev environment is running."
echo "Follow logs: docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f dashboard"

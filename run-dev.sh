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
docker compose -f docker-compose.dev.yml up -d

if command -v curl >/dev/null 2>&1; then
  echo "Waiting for dashboard to become ready..."
  for _ in $(seq 1 90); do
    if curl -fsS "http://127.0.0.1:8080" >/dev/null 2>&1; then
      echo "Dev environment is ready at http://127.0.0.1:8080"
      echo "Follow logs: docker compose -f docker-compose.dev.yml logs -f dashboard"
      exit 0
    fi
    sleep 1
  done

  echo "Dashboard did not become ready in time." >&2
  echo "Check logs: docker compose -f docker-compose.dev.yml logs -f dashboard" >&2
  exit 1
fi

echo "Dev container started. Install curl to enable readiness checks."
echo "Follow logs: docker compose -f docker-compose.dev.yml logs -f dashboard"

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but not installed" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose is required but not available" >&2
  exit 1
fi

cleanup() {
  docker compose -f docker-compose.e2e.yml down -v --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

cleanup

echo "Starting dashboard container for E2E..."
docker compose -f docker-compose.e2e.yml up -d --build dashboard

echo "Installing E2E dependencies..."
docker compose -f docker-compose.e2e.yml run --rm e2e bash -lc "npm ci"

echo "Running core Playwright suite..."
docker compose -f docker-compose.e2e.yml run --rm e2e bash -lc "npx playwright test tests/dashboard.spec.ts"

echo "Seeding persistence test data..."
docker compose -f docker-compose.e2e.yml run --rm e2e bash -lc "npx playwright test tests/seed-persistence.spec.ts"

echo "Restarting dashboard container to validate persistence..."
docker compose -f docker-compose.e2e.yml restart dashboard

echo "Running post-restart persistence test..."
docker compose -f docker-compose.e2e.yml run --rm e2e bash -lc "npx playwright test tests/persistence-after-restart.spec.ts"

echo "E2E suite passed."

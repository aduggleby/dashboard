#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "Stopping dashboard dev containers..."
docker compose -f docker-compose.dev.yml down
echo "Dev environment stopped."

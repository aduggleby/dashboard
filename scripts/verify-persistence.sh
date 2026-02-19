#!/usr/bin/env bash
set -euo pipefail

docker compose up -d --build
echo "Create a card in the UI at http://localhost:8080, then press Enter to continue"
read -r _
docker compose restart dashboard
echo "Container restarted. Verify your card is still visible."

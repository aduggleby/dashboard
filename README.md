# Dashboard

Dashboard is an ASP.NET Core MVC (.NET 10) homelab launcher for self-hosted apps. It renders title-only cards in a responsive grid, stores data in SQLite, supports drag and keyboard reordering, and includes Origami light/dark themes.

| Light | Dark |
| --- | --- |
| ![Light](docs/screenshots/dashboard-light-playwright.png) | ![Dark](docs/screenshots/dashboard-dark-playwright.png) |

## Features

- Title-only app cards (no visible URL text)
- Add, edit, and delete cards from the UI (right-click a card to edit or delete)
- URL validation (`http://` / `https://` absolute URLs only)
- Customizable dashboard title via settings gear, persisted per browser
- Browser tab title syncs with the dashboard title
- Deterministic ordering (`SortOrder`, then `Title`)
- Drag-and-drop reorder with persistence
- Keyboard reorder (`Alt+ArrowUp`, `Alt+ArrowDown`)
- Help dialog (`?` or `F1`) with keyboard shortcuts and usage reference
- Origami light/dark theme toggle with browser persistence
- SVG favicon
- SQLite persistence for simple backup/restore
- Serilog file logging with daily rolling files retained for 30 days

## Project Layout

- `src/Dashboard.Web` - MVC app, EF Core, views, static assets
- `tests/Dashboard.Web.Tests` - unit tests
- `tests/Dashboard.Web.IntegrationTests` - SQLite integration tests
- `docker-compose.yml` - production-oriented local container run
- `docker-compose.dev.yml` - containerized dev workflow
- `build.csando` - ANDO build/publish script
- `docs/deployment/truenas.md` - deployment notes

## Local Development

Requirements:

- .NET SDK 10+
- Docker + Docker Compose (for dev container workflow)

```bash
dotnet restore Dashboard.slnx
dotnet build Dashboard.slnx
dotnet test Dashboard.slnx
dotnet run --project src/Dashboard.Web/Dashboard.Web.csproj --urls http://127.0.0.1:8080
```

Open `http://127.0.0.1:8080`.

### Dev container run

```bash
./run-dev.sh
```

Stop dev environment:

```bash
./stop-dev.sh
```

## Publishing ANDO Build + GHCR Publish

This repo use the [Ando Build System](https://andobuild.com).

Run build/test pipeline:

```bash
ando
```

Publish version

```bash
ando release
```

## TrueNAS SCALE Deployment (Custom App YAML)

### Overview

Use TrueNAS Apps -> Discover Apps -> Custom App and paste YAML. Mount a single persistent dataset to `/app/storage`.

Security note: this app has no built-in auth. Keep it on LAN/VPN-only networks.

### Prerequisites

1. TrueNAS SCALE Apps pool configured.
2. Dataset created for app data, for example:
   - `/mnt/tank/apps/dashboard/data`
3. Dataset writable by the container runtime user (or equivalent ACL).
4. Docker image available in GHCR.

### Custom App YAML (ready to paste)

```yaml
services:
  dashboard:
    image: ghcr.io/aduggleby/dashboard:latest
    pull_policy: always
    container_name: dashboard-web
    restart: unless-stopped
    environment:
      ConnectionStrings__DashboardDb: Data Source=/app/storage/data/dashboard.db
      ASPNETCORE_HTTPS_PORT: 443
    ports:
      - "80:8080"
      - "443:8443"
    volumes:
      - /mnt/tank/apps/dashboard:/app/storage
      - dashboard-certs:/app/certs

volumes:
  dashboard-certs:
```

Notes:

- A self-signed TLS certificate is auto-generated on first startup and persisted in the `dashboard-certs` volume.
- The app creates `/app/storage/data` and `/app/storage/logs` at startup.

### Runtime Configuration

| Variable | Default | Notes |
| --- | --- | --- |
| `ConnectionStrings__DashboardDb` | `Data Source=/app/storage/data/dashboard.db` | SQLite DB location inside container |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Use `Development` only for local dev |
| `ASPNETCORE_URLS` | `http://+:8080;https://+:8443` | Container bind addresses/ports |
| `ASPNETCORE_HTTPS_PORT` | _(not set)_ | External HTTPS port for HTTP→HTTPS redirect (e.g. `443`) |

Logging defaults:

- Production file logs: `/app/storage/logs/dashboard-.log`
- Rolling interval: daily
- Retention: 30 files (roughly 30 days)
- Because `/app/storage` is volume-mounted in TrueNAS YAML, logs are persisted on disk with application data.


## Backup and restore

Back up the dataset mounted to `/app/storage` (minimum file: `data/dashboard.db`).

Restore procedure:

1. Stop app.
2. Restore dataset/files.
3. Start app.
4. Validate cards and ordering.


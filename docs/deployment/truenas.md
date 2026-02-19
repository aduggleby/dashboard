# TrueNAS Deployment Notes

## Runtime requirements
- Mount one persistent volume to `/app/storage`.
- Mount one persistent volume to `/app/certs` (stores the auto-generated self-signed TLS certificate).
- Use `ConnectionStrings__DashboardDb=Data Source=/app/storage/data/dashboard.db`.
- Set `ASPNETCORE_HTTPS_PORT` to the external HTTPS port (e.g. `443`).
- Serilog writes rolling logs to `/app/storage/logs/dashboard-.log` with 30-file retention.
- The app creates `data/` and `logs/` directories on startup.
- Keep this app on a LAN/VPN boundary; no built-in auth is provided.

## Ports
- **HTTP** (port 8080 inside container) — redirects to HTTPS.
- **HTTPS** (port 8443 inside container) — serves the dashboard with a self-signed certificate.

Map them to your desired host ports, e.g. `80:8080` and `443:8443`.

## Build and run
```bash
docker compose up -d --build
```

## Migrations
Database migrations are applied automatically on startup in all environments.

## Permissions
If your TrueNAS dataset uses fixed UID/GID ownership, set container user accordingly in your app config and ensure write permissions on `/app/storage` and `/app/certs`.

## Persistence check
1. Open the dashboard and create one card.
2. Restart container: `docker compose restart dashboard`.
3. Confirm the card still appears.

## Backup
Backup the dataset or at minimum `/app/storage/data/dashboard.db` as part of your standard NAS backup policy.

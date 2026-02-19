# TrueNAS Deployment Notes

## Runtime requirements
- Mount one persistent volume to `/app/storage`.
- Use `ConnectionStrings__DashboardDb=Data Source=/app/storage/data/dashboard.db`.
- Serilog writes rolling logs to `/app/storage/logs/dashboard-.log` with 30-file retention.
- The app creates `data/` and `logs/` directories on startup.
- Keep this app on a LAN/VPN boundary; no built-in auth is provided.

## Build and run
```bash
docker compose up -d --build
```

## Migrations policy
Run database migrations explicitly during deployment:
```bash
docker compose run --rm dashboard dotnet ef database update
```

## Permissions
If your TrueNAS dataset uses fixed UID/GID ownership, set container user accordingly in your app config and ensure write permissions on `/app/storage`.

## Persistence check
1. Open the dashboard and create one card.
2. Restart container: `docker compose restart dashboard`.
3. Confirm the card still appears.

## Backup
Backup the dataset or at minimum `/app/storage/data/dashboard.db` as part of your standard NAS backup policy.

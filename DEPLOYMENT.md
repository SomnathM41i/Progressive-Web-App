# Deployment

Target: subdomain **`pwa.digitalji.in`** on Hostinger shared hosting. Hostinger is
connected to this repository and **pulls on push** — it does not run a build, so
everything it needs must already be built and committed.

## How it works

`main` holds the source (as usual). `.github/workflows/ci-cd.yml` runs on every
push/PR:

1. **frontend** — `npm ci`, lint, typecheck, build.
2. **backend** — `composer install`, `php artisan test`.
3. **deploy** (push to `main` only, after 1 and 2 pass) — builds the PWA, installs
   backend production dependencies, assembles a ready-to-serve tree, and publishes
   it to the **`deploy`** branch.

The published `deploy` branch looks like:

```text
/                  built PWA (index.html, assets/, icons/, sw.js, manifest.webmanifest)
├── .htaccess      SPA fallback + routes /api/* into Laravel
└── api/           Laravel app (vendor included) → front controller api/public/index.php
```

Hostinger pulls the `deploy` branch (no build needed) into the `pwa.digitalji.in`
folder. Pushing to `main` is the only action the developer takes.

## One-time host setup

Do these once in hPanel (File Manager / Git screen):

1. **Advanced → Git**: set the deployed **branch** to `deploy` and the **root
   directory** to the `pwa.digitalji.in` document root. (Reconnect/`Redeploy`
   after the first `deploy` branch is created by the first push.)
2. **PHP version**: set to **8.2+** (matches CI).
3. **`api/.env`**: create it in File Manager from `backend/.env.production.example`
   (it is not committed). Fill the MySQL credentials and `APP_KEY`.
   - Generate `APP_KEY` locally with `php artisan key:generate --show` and paste it.
4. **MySQL**: create a database + user in hPanel and fill the `DB_*` values.
5. **Permissions**: ensure `api/storage` and `api/bootstrap/cache` are writable
   (e.g. `755`/`775`).
6. **Migrations** (once the API needs them): run from hPanel's terminal if
   available, or add a temporary one-off route — otherwise migrations cannot run
   without shell access.

The document root must be the repo root of the `deploy` branch (the folder that
contains `index.html`). Requests to `/api/...` are routed to Laravel by the root
`.htaccess`; the Laravel app is protected from direct browsing.

## Changing settings

- **Different deploy branch name**: edit `publish_branch` in
  `.github/workflows/ci-cd.yml` and re-point Hostinger's Git branch.
- **Different domain**: update `APP_URL`/`FRONTEND_URL` in `api/.env` on the host
  and `VITE_API_BASE_URL` in the workflow if the API is not same-origin.
- **API on a different subdomain**: set `VITE_API_BASE_URL` to that origin in the
  deploy job and the backend `FRONTEND_URL`/`cors.php` to the PWA origin.

## Verifying a deploy

- GitHub → Actions: the `deploy` job completes and pushes `deploy`.
- Hostinger → Git: a new deployment appears after the push (auto-deployment on).
- `https://pwa.digitalji.in/` serves the PWA; `https://pwa.digitalji.in/api/health`
  returns `{"status":"ok", ...}`.

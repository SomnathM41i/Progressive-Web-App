# Deployment — Shivaraj Maratha PWA

Static deploy of the built React app (Vite SPA + PWA) to a subdomain document root.

- **Live target:** https://pwa.digitalji.in/ (served from the domain root, so
  `base: '/'`, manifest `scope`/`start_url` `/` and `/assets/*` paths all work unchanged)
- **Artifact:** `pwa.digitalji.in-deploy.zip` — the **contents of `frontend/dist`**
  placed at the **top level** of the archive (not wrapped in a `dist/` folder), so
  extracting it directly into the document root is enough.
- **Build mode:** this build has the development preview **on**
  (`VITE_ENABLE_DEV_PREVIEW=true`), so the live site behaves exactly like local:
  the Welcome screen offers "Dashboard preview (development)" and the dashboard,
  shortlist, stub screens etc. are all browsable. No real login/API is wired up yet.

> Reminder: `docs/` and this file's neighbours `AGENTS.md`/`docs/` are gitignored;
> `pwa.digitalji.in-deploy.zip` and `frontend/.env.production.local` are build
> outputs, not source — do not commit them.

---

## 1. Create the subdomain (hPanel)

1. hPanel → **Domains → Subdomains** → create `pwa.digitalji.in`.
2. Set its **document root** (e.g. `public_html/pwa`). hPanel normally adds the DNS
   `A` record automatically; wait for DNS + the subdomain to become active.

## 2. Upload & extract

1. hPanel → **Files → File Manager**, open the subdomain's document root.
2. Upload `pwa.digitalji.in-deploy.zip`.
3. Right-click → **Extract** into that same folder.
4. Make sure File Manager is showing hidden files — `.htaccess` **must** be at the
   top level of the document root, alongside `index.html`.
5. Delete the zip afterwards (optional).

Resulting document root:

```
index.html          manifest.webmanifest   sw.js
.htaccess           favicon.ico            favicon.png
assets/             icons/                 apple-touch-icon.png
workbox-*.js
```

## 3. Enable HTTPS (required for the PWA)

1. hPanel → **Security → SSL** → install the free Let's Encrypt certificate for
   `pwa.digitalji.in`.
2. Turn on **Force HTTPS**.
3. Service workers and "Add to Home screen" only work over HTTPS.

## 4. Verify

- `https://pwa.digitalji.in/` loads the Welcome screen.
- Tap **Dashboard preview (development)** → the full dashboard renders.
- Deep link + refresh: open `https://pwa.digitalji.in/home` and
  `https://pwa.digitalji.in/shortlist` directly — both must load (not 404). This is
  what `.htaccess` fixes.
- `https://pwa.digitalji.in/manifest.webmanifest` and
  `https://pwa.digitalji.in/sw.js` return 200.
- Browser menu → **Install app / Add to Home screen** appears.

## What `.htaccess` does

- **SPA fallback:** real files/directories are served as-is; every other URL is
  rewritten to `/index.html` so React Router handles it.
- **Caching:** hashed `/assets/*` are cached for a year (`immutable`);
  `index.html`, `sw.js`, `manifest.webmanifest` and `workbox-*.js` are sent
  `no-cache` so new deployments are picked up.
- **Compression:** gzip for HTML/CSS/JS/JSON/SVG via `mod_deflate`.
- Blobs are mirrored from `frontend/public/.htaccess`, so every future build ships it.

## Rebuilding / moving to the real API later

From `frontend/`:

```bash
npm ci
npm run build      # outputs frontend/dist
```

Then zip the **contents** of `dist` (files at the archive root):

```bash
cd dist && zip -r ../../pwa.digitalji.in-deploy.zip . && cd ../..
```

For the **real launch** (real backend instead of preview):

1. Remove/inspect `frontend/.env.production.local` (this is what turns the preview on).
2. Keep `VITE_ENABLE_DEV_PREVIEW=false` in the committed `frontend/.env.production`.
3. Point `VITE_API_BASE_URL` at the live API and confirm CORS/`FRONTEND_URL` on the
   backend. Note: the frontend currently targets `https://shivrajmaratha.com/apis`
   while Laravel serves its API under `/api` — reconcile one of the two before launch.
4. Rebuild and re-upload as above.

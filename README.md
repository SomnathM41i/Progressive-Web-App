# Shivaraj Maratha PWA

A premium, mobile-first Progressive Web App for **Shivaraj Maratha** (वधू वर सूचक केंद्र). Built with **React + TypeScript + Vite** on the frontend and **Laravel 12** on the backend.

- Reference: https://shivrajmaratha.com/
- Tagline: "योग्य नात्यांची विश्वासार्ह सुरुवात"

## Repository layout

```text
shivaraj-maratha-pwa/
├── frontend/        # React + TS + Vite PWA
├── backend/         # Laravel 12 API skeleton
├── docs/            # Architecture notes
│   ├── architecture.md
│   └── api-integration.md
└── README.md
```

## Getting started

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev` → http://localhost:5173
4. Build: `npm run build`
5. Preview: `npm run preview`
6. Lint: `npm run lint`
7. Format: `npm run format:write`

`.env.development` is committed and enables dev preview by default. To override locally, create `.env.local` (git-ignored).

#### Dev preview mode

`VITE_ENABLE_DEV_PREVIEW=true` (default in `.env.development`) lets you preview the authenticated dashboard without a backend. A small "Preview data" notice is shown on authenticated screens to make it explicit that the content is placeholder data only.

### Backend

1. `cd backend`
2. `composer install`
3. `cp .env.example .env`
4. `php artisan key:generate`
5. `php artisan migrate` (SQLite by default)
6. `php artisan serve` → http://127.0.0.1:8000

Set `FRONTEND_URL` in `.env` to the origin the PWA is served from; it drives the CORS allow-list (`config/cors.php`). Locally that is `http://localhost:5173`.

A single connectivity endpoint is available at `GET /api/health`. Beyond that, the backend is a clean Laravel 12 skeleton prepared for integration with the existing API collection — no speculative business endpoints have been created.

Tests: `php artisan test` · Format: `vendor/bin/pint`

## Key features

- Mobile-first PWA with install/update handling
- Branded splash screen with logo reveal and progress animation
- Controlled initialization lifecycle with minimum splash duration
- Auth boundary with dev-preview session (no fake production auth)
- Dashboard with profile summary, quick actions, recommendations, announcements
- Centralised toast notification system (success/error/warning/info/loading)
- Bottom navigation with safe-area support
- Design tokens via Tailwind v4 `@theme`
- Offline-ready app shell (private API responses are never cached)

## Integration notes

See `docs/api-integration.md` for the integration contract and where to wire the existing API collection. The code is written to be adapted without guessing request/response shapes.

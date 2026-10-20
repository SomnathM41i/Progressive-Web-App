# Project Context

Single-source orientation file for anyone (human or agent) working on this
repository. Read this first, then go deeper via the docs listed at the bottom.

Last reviewed: 2026-10-20

## What this is

**Shivaraj Maratha** (शिवराज मराठा) — a mobile-first Progressive Web App for a
Maratha-community matrimonial matchmaking centre in Satara, running since 2013.
Reference site: https://shivrajmaratha.com/

- Tagline: `योग्य नात्यांची विश्वासार्ह सुरुवात`
- Sub-brand: `वधू वर सूचक केंद्र`
- Public business details live in `frontend/src/config/business.ts` — do not
  hardcode phone, address or email elsewhere.

## Repository layout

```text
shivaraj-maratha-pwa/
├── frontend/     # React 19 + TypeScript + Vite PWA (the actual product)
├── backend/      # Laravel 12 API skeleton (health check only)
├── docs/         # architecture.md, api-integration.md, profile-plan.md
├── AGENTS.md     # language convention — binding for agents
└── CONTEXT.md    # this file
```

## Tech stack

**Frontend** (`frontend/`)

| Layer | Choice |
|---|---|
| UI | React 19.3, React Router 7.18 (`react-router-dom`), lucide-react icons |
| Language | TypeScript ~6.0.2, strict, `@/*` → `src/*` alias |
| Build | Vite 8.3 + `vite-plugin-pwa` (registerType: `prompt`) |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite`, tokens in `src/styles/tokens.css` |
| HTTP | axios 1.20 (single shared client in `src/services/api.ts`) |
| State | React Context + hooks only — no external state library |
| Lint / format | oxlint + Prettier (`prettier-plugin-tailwindcss`) |

**Backend** (`backend/`)

- Laravel 12, PHP ^8.2, SQLite by default (`.env.example` also shows MySQL).
- Only endpoint: `GET /api/health`. Framework-level `GET /up` as well.
- `FRONTEND_URL` in `.env` drives the CORS allow-list (`config/cors.php`).
- No business endpoints by design — see "Where the data actually comes from".

## Where the data actually comes from

The browser talks **directly to the legacy PHP API** on a separate origin, not
to the Laravel backend:

```text
VITE_API_BASE_URL = https://shivrajmaratha.com/apis
```

The Laravel backend is a prepared-but-unwired shell for a future API layer.

### Legacy API quirks (read before writing any service)

These are confirmed from live integration, not guesses:

1. **HTTP 200 always.** Failures also return 200 — success is decided by the
   JSON `status` field (`'success' | 'error'`), never by the HTTP code. Some
   services treat any unrecognised value as success and only raise on a known
   failure token (`error`, `failed`, `0`, `false`).
2. **Envelope varies.** Most endpoints return `{ status, message, data }`;
   some return `gallery[]`, `documents[]`, `settings`, `results[]`, or a
   feature-specific key. The interests and shortlist services scan a tolerant
   key list (`results`, `data`, `interests`/`shortlist`, `list`, `records`,
   `items`) and take the first array found. Normalise inside the service.
3. **Requests are form-encoded.** `POST` bodies are `URLSearchParams`
   (`multipart/form-data` for some profile endpoints, `MatriID` as a field).
   Only CORS-safelisted headers are sent so no preflight is triggered.
4. **No token, no usable cookie.** The API returns no bearer token and sets no
   cookie valid cross-origin. Identity is the `MatriID` supplied per request.
   The session lives client-side in `sessionStorage` under `shivaraj.session`.
5. **Relative media URLs.** Anything starting with `/` (e.g. `/gallary/...`)
   must be resolved against `https://shivrajmaratha.com` — see `buildPhotoUrl`
   in the matches, interests and shortlist services.
6. **CORS is `Access-Control-Allow-Origin: *`** on the legacy API, which is why
   the frontend axios client keeps `withCredentials: false`.

### Integrated legacy endpoints

Confirmed in code (all under `VITE_API_BASE_URL`):

| Feature | Endpoint(s) |
|---|---|
| Auth | `POST /login.php` |
| Matches | `POST /get-mutual-matches.php` |
| Interests | `/getMyReceivedInterestList.php`, `/getMyPendingInterestList.php`, `/send-interest.php`, `/accept-interest.php`, `/decline-Interest.php`, `/mark-not-interested.php` |
| Shortlist | `/get-list-MyShortlistedProfiles.php`, `/get-list-WhoShortlistedMyProfile.php`, `/shortlist-user-profile.php`, `/remove-user-from-shortlist.php` |

## Frontend architecture rules

Enforced by existing code and `docs/architecture.md`:

- Feature-oriented: `src/features/<feature>/{pages,components,services,hooks,types}`.
  Shared primitives live in `src/components/ui`.
- **Pages never call axios directly.** Every network call goes through a
  feature service (`*.service.ts`), which maps responses to typed domain objects.
- Errors leave the API layer only as `ApiError` (via `toApiError`);
  `ApiNotIntegratedError` marks a feature that is deliberately unwired.
- Route paths are centralised in `src/config/routes.ts`; never inline paths.
- Build-time config is read only in `src/config/env.ts`; nothing else touches
  `import.meta.env`.
- Session restoration runs once in `useAppInitialization` (startup lifecycle),
  not in `AuthProvider`'s mount effect. Splash → session check → router hand-off
  is one ordered sequence.
- Guards: `RequireAuth` / `RedirectIfAuthenticated` in `src/app/guards.tsx`.
- Styling consumes design tokens (brand maroon `#990D32`, DM Sans / Noto Sans
  Devanagari / Playfair Display) — no hardcoded colours or spacing.

## Current state (maturity matrix)

| Area | Status |
|---|---|
| Splash, startup lifecycle, PWA install/update | ✅ Real |
| Auth login / restore / logout | ✅ Real (`POST /login.php`, sessionStorage session) |
| Matches (mutual matches) | ✅ Real (`POST /get-mutual-matches.php`) |
| Interests (received / sent / send / accept / decline / not-interested) | ✅ Real (6 endpoints, paginated lists) |
| Shortlist (mine / who-shortlisted-me / add / remove) | ✅ Real (4 endpoints) + `ShortlistProvider` context |
| HTTP client, error model, toasts, guards | ✅ Real |
| Dashboard data | ⚠️ Stub — throws `ApiNotIntegratedError` unless `VITE_ENABLE_DEV_PREVIEW=true` (placeholder data) |
| Profile detail | ⚠️ Partial — renders preview data; **Send interest** and **shortlist toggle** are real. No profile-fetch endpoint yet |
| My Profile section (overview + 11 detail screens) | ✅ Real — read-only, 11 `get-*` endpoints (`docs/profile-plan.md`) |
| Profile edit / registration / update flows | ⛔ `ComingSoon` — write endpoints deliberately out of scope |
| Search, chat, notifications, success stories | ⛔ Placeholder / mock UI (search and chat have local mock state) |
| Backend business endpoints | ⛔ None (only `/api/health`) |

> Note: `docs/architecture.md` and `docs/api-integration.md` still describe auth
> and dashboard as stubs. **Auth, matches, interests and shortlist are now
> integrated for real** — trust the code over those two docs on this point.

## Configuration

**Frontend env** (read exclusively through `src/config/env.ts`):

| Variable | Purpose | Dev | Prod |
|---|---|---|---|
| `VITE_API_BASE_URL` | Legacy API origin | `https://shivrajmaratha.com/apis` | same |
| `VITE_API_TIMEOUT` | Request timeout ms | `15000` | `15000` |
| `VITE_ENABLE_DEV_PREVIEW` | Placeholder authenticated UI | `true` | `false` |

`.env.development` and `.env.production` are committed; `.env.local` and
`.env.production.local` are gitignored for overrides. **Never enable dev
preview in a real release** — it renders clearly-labelled placeholder data.

**Backend env**: `FRONTEND_URL` (CORS origin, default `http://localhost:5173`),
standard Laravel keys, SQLite database file.

## Commands

```bash
# Frontend
cd frontend
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # tsc -b && vite build
npm run typecheck    # tsc -b --noEmit
npm run lint         # oxlint  (lint:fix to autofix)
npm run format:write # prettier

# Backend
cd backend
composer install && cp .env.example .env
php artisan key:generate && php artisan migrate
php artisan serve     # → http://127.0.0.1:8000
php artisan test      # phpunit
vendor/bin/pint       # format
```

## Conventions

- **Language**: English for all UI chrome and developer text; Marathi only for
  genuine content (brand, names, places, announcements). Binding — see `AGENTS.md`.
- Toasts: `toast.success/error/warning/info/loading` with English messages.
- Commits: English, conventional-ish prefix (`feat:`, `fix:`, `chore:`, `docs:`).
- Human-written, small, readable files. No speculative endpoints or invented
  response shapes — fail loudly with `ApiNotIntegratedError` instead.

## Resilience (edge-case audit pass)

A full-app edge-case audit (26 findings) was applied to the read-only surface.
Behaviour now:

- **Crash safety**: `app/ErrorBoundary.tsx` wraps the provider tree in `main.tsx`
  and a route-level boundary (keyed by pathname) sits around `<Outlet />` in
  `AppLayout`. Global `error`/`unhandledrejection` listeners log to console.
- **Auth**: `auth.service` tolerates `success`/`1`/`ok`/`true`, and restores a
  session only when `user.profileId` is a non-empty string.
- **List services** (`matches`, `interests`, `shortlist`): tolerant envelope scan,
  failure detection by JSON `status`, numeric id coercion, and nulled rows on a
  missing id. All photo URLs go through `features/profiles/media.resolveMediaUrl`
  (handles `//host` protocol-relative).
- **Shortlist storage**: per-member key `svr.shortlist.v1.<memberId>` (plus an
  anonymous key), with in-flight mutation guards and rollback derived live.
- **Profile screens**: overview shows a full `ErrorState` with retry (and an
  inline membership note); `ProfileDetailPage` shows an honest error on a
  deep-link without state; membership status/dates are derived in
  `features/profiles/dates.ts`; media `DetailRow`s render a resolved link;
  sections show "Not added yet." when empty.
- **Dashboard / matches**: announcements skip unparseable dates and unknown
  tones; `MatchesPage` cancels stale requests and offers retry.
- **Environment**: `config/env.ts` validates `VITE_API_BASE_URL` and warns in dev
  rather than silently shipping bad requests.

## Known gaps / likely next steps

1. Write flows for the profile section (registration + `update-*` endpoints) and
   their Master Data dropdowns — read-only screens are done.
2. Give the dashboard a real endpoint so production isn't on the error path.
3. Add a profile-fetch endpoint so `ProfileDetailPage` stops relying on preview
   data (its interest/shortlist actions are already real).
4. Decide the future of the Laravel backend: proxy/normalisation layer for the
   legacy PHP API, or retire it. Today the frontend bypasses it entirely.
5. Update `docs/architecture.md` / `docs/api-integration.md` to reflect the
   integrated auth, matches, interests and shortlist services.

## Docs index

> Heads-up: per the root `.gitignore`, `AGENTS.md` and `docs/` are local-only
> notes and are **not** committed. This `CONTEXT.md` is the tracked equivalent —
> keep it updated when those notes change in ways that matter to a fresh clone.

| File | Contents |
|---|---|
| `AGENTS.md` | Language convention (binding) |
| `docs/architecture.md` | Frontend structure, auth boundary, PWA, tokens (partially stale) |
| `docs/api-integration.md` | Integration contract and checklist (partially stale) |
| `docs/profile-plan.md` | Profile section: endpoints, field inventory, screen map |
| `README.md` | Getting started and repo overview |

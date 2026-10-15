# Architecture

## Goals

- Human-written, maintainable code: clear responsibilities, small files, readable naming.
- Feature-oriented structure. Shared UI lives in `components/ui`. Feature-specific code stays under `features/`.
- API calls never live in page components. Use services + hooks.
- Toasts, routing, auth and PWA concerns are centralised.
- Design tokens drive all styling (Tailwind v4 `@theme`).

## Frontend structure

```text
frontend/src
├── app/                # App composition, router, guards, startup
├── components/
│   ├── feedback/       # Toasts, PWA prompts, offline banner, preview notice
│   ├── loading/        # Splash, loaders, spinners
│   ├── navigation/     # Header, bottom nav
│   ├── states/         # Empty, error, coming-soon
│   └── ui/             # Buttons, inputs, cards, badges, avatar, page frame
├── config/             # Routes, env
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── membership/
│   ├── notifications/
│   ├── profiles/
│   ├── search/
│   └── shortlist/
├── hooks/              # App-wide hooks (init, online, install, pwa update, toast)
├── layouts/            # AppLayout, AuthLayout
├── lib/                # Utilities (cn, storage)
├── services/           # Shared API client + error normalisation
├── styles/             # tokens.css + index.css
└── vite-env.d.ts       # Vite + PWA client types
```

## Auth boundary

- `features/auth/services/auth.service.ts` defines the `AuthService` interface.
- In production builds (no dev preview), `restoreSession` returns `null` and `login` throws `ApiNotIntegratedError` — no fake auth.
- In dev preview, a minimal in-memory/sessionStorage session is used to preview authenticated screens. The UI shows a "Preview data" notice.
- `AuthProvider` registers the token provider and 401 handler with the shared API client.
- Session restoration is driven by the startup lifecycle (`useAppInitialization`), not by `AuthProvider`'s own mount effect. That keeps the splash, the session check and the router hand-off in one ordered sequence and guarantees the session is restored exactly once. `restore` is exposed on the context for the retry path.

## Data sources

- `dashboardService` has two implementations: unconfigured (throws `ApiNotIntegratedError`) and preview (returns typed placeholder data). The choice is gated by `env.devPreview`.
- Feature services follow the same pattern: define an interface, throw `ApiNotIntegratedError` until the API collection is wired.

## PWA

- `vite-plugin-pwa` with `registerType: 'prompt'` so updates are user-controlled.
- Service worker precaches the app shell only; authenticated/API responses are never cached.
- `useInstallPrompt` and `usePwaUpdate` handle install and update lifecycle.
- Manifest includes maskable and standard icons generated from the official logo.

## State management

React Context + hooks. No external state library. Toast queue is local to `ToastProvider`. Auth state is local to `AuthProvider`.

## TypeScript

Strict mode enabled. Path alias `@/*` → `src/*`. `verbatimModuleSyntax` and `erasableSyntaxOnly` are used. `any` is avoided.

## Linting & formatting

- Oxlint (fast) for linting with React + TypeScript rules.
- Prettier with `prettier-plugin-tailwindcss` for consistent formatting.

## Design tokens

Defined in `src/styles/tokens.css` via Tailwind v4 `@theme`. Brand colours, fonts (DM Sans, Noto Sans Devanagari, Playfair Display), radii, shadows, and motion tokens are centralised. Components consume these via Tailwind utilities rather than hardcoded values.

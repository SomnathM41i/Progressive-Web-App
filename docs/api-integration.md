# API Integration

The existing API collection will be provided separately. Until it is integrated, the frontend uses explicit boundaries that fail loudly rather than inventing endpoints.

## Integration points

| Concern | File(s) | Status |
|---|---|---|
| Auth session restore/login/logout | `features/auth/services/auth.service.ts` | Stub (throws `ApiNotIntegratedError`) |
| Dashboard data | `features/dashboard/services/dashboard.service.ts` | Stub (throws `ApiNotIntegratedError`) |
| HTTP client | `services/api.ts` | Ready (base URL, timeout, token provider, 401 handler, error normalisation) |
| Error model | `services/api-error.ts` | Ready (`ApiError`, `toApiError`) |

## How to integrate

1. Set `VITE_API_BASE_URL` in `.env.development`/`.env.production`.
2. Replace the bodies of the service methods with `api.get/post/...` calls.
3. Map API response shapes to the TypeScript interfaces defined in each feature's `types.ts`. Only keep fields the UI actually uses.
4. If the API uses cookie-based auth, the existing `withCredentials: true` and 401 handler are sufficient. If it uses Bearer tokens, ensure the token provider returns the current token.
5. Remove or keep the dev-preview implementations behind `env.devPreview` only while iterating. Do **not** enable dev-preview in production.

## Conventions

- Never call `fetch`/`axios` directly from React components. Always go through a feature service.
- Keep request/response mapping inside the service (or a small mapper). Pages/components consume typed domain objects.
- Normalise errors via `toApiError` so the UI can render a consistent message.
- Do not cache authenticated responses. The service worker only precaches the app shell.
- Environment values must not contain secrets. The frontend reads public config only.

## Verification checklist

- [ ] All service methods map to real endpoints from the API collection
- [ ] Response envelopes match the mapped interfaces (no `any`)
- [ ] Auth token/cookie handling matches the chosen mechanism
- [ ] 401s redirect to the welcome/login screen
- [ ] No network calls from presentation components
- [ ] Dev-preview flag remains `false` in production builds

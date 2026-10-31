# Project Context

Single-source orientation file for anyone (human or agent) working on this
repository. Read this first, then go deeper via the docs listed at the bottom.

Last reviewed: 2026-10-26

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
| Auth | `POST /login.php`, `POST /forgot-password.php` (`email`; success response not yet seen live) |
| Matches | `POST /get-mutual-matches.php` |
| Interests | `/getMyReceivedInterestList.php`, `/getMyPendingInterestList.php`, `/send-interest.php`, `/accept-interest.php`, `/decline-Interest.php`, `/mark-not-interested.php` |
| Shortlist | `/get-list-MyShortlistedProfiles.php`, `/get-list-WhoShortlistedMyProfile.php`, `/shortlist-user-profile.php`, `/remove-user-from-shortlist.php` |
| Contact details | `/ViewUserContactDetails.php` (`MatriID`, `ProfileID`; first unlock costs one `remaining_contacts`, repeats are free), `/get-list-MyViewedContactDetails.php` (`MatriID`, `page`; rows embed `ContactDetails`) |
| Search | `/advance-search.php` — see `features/search/types.ts` for the confirmed contract |
| Profile views | `/get-list-WhoViewedMyProfile.php`, `/get-list-MyViewedProfiles.php` (`MatriID`, `page`; 8 per page), `/update-ProfileViewCount.php` (`ViewerID`, `ProfileID`) |

Profile-view list rows carry only `MatriID, Education, Occupation, Age, Height,
ViewedOn` (`DD-MM-YYYY`) plus a photo — `Photo` (bare filename, needs
`/gallary/`) on "who viewed me", `photo_url` on "my viewed". Names, gender and
location are filled from `get_profile_details.php` via
`publicProfileService.fetchSummary`. The server keeps one row per
viewer/profile pair with the first-view date.

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
| Contact details (plan-gated unlock on profile, `/viewed-contacts` list) | ✅ Real (2 endpoints) |
| Profile views (viewed me / I viewed / record view on profile open) | ✅ Real (3 endpoints) — `/profile-views`, dashboard quick-access tile |
| HTTP client, error model, toasts, guards | ✅ Real |
| Dashboard data | ⚠️ Stub — throws `ApiNotIntegratedError` unless `VITE_ENABLE_DEV_PREVIEW=true` (placeholder data) |
| Profile detail | ⚠️ Partial — renders preview data; **Send interest** and **shortlist toggle** are real. No profile-fetch endpoint yet |
| My Profile section (overview + 11 detail screens) | ✅ Real — read-only, 11 `get-*` endpoints (`docs/profile-plan.md`) |
| Registration / profile update flows | ⚠️ Wizard steps and review are implemented; live API contract validation and a few payload/UI gaps remain |
| Advanced search | ✅ Real (`POST /advance-search.php`, master-data dropdowns, 24 per page) |
| Notifications, success stories | ⛔ Placeholder / mock UI |
| Chat | 🚫 Hidden — all entry points removed, `/chat` redirects to `/home`; `features/chat` is kept unused |
| Backend business endpoints | ⛔ None (only `/api/health`) |

> Note: `docs/architecture.md` and `docs/api-integration.md` still describe auth
> and dashboard as stubs. **Auth, matches, interests and shortlist are now
> integrated for real** — trust the code over those two docs on this point.

## Registration flow (in progress)

This is the current workstream. Codex should read this section before changing
anything under `frontend/src/features/registration/`.

### Scope and source of truth

- Live API base: `https://shivrajmaratha.com/apis`.
- Postman source:
  `/mnt/c/Users/Somnath Mali/Downloads/SVR Matrimony API Collection.postman_collection (1).json`
  — folders `Registration Master` and `Master Data`.
- Write endpoints: `register.php`, `update-basic-details.php`,
  `update-contact-details.php`, `update-education_occupation-details.php`,
  `update-family-details.php`, `update-horoscope-details.php`,
  `update-partner-preference-details.php`, `update-nri-details.php`.
- Read endpoints: `get-basic-details.php`, `get-contact-details.php`,
  `get-education_occupation-details.php`, `get-family-details.php`,
  `get-horoscope-details.php`, `get-partner-preference-details.php`.
- There is **no NRI read endpoint** in the collection; the NRI form is
  write-only for now.
- Master Data endpoints are `GET`. Query-parameter endpoints need the `.php`
  suffix (`get-caste-list.php?religion=Hindu`); without it the server returns
  website HTML instead of JSON.

### Implemented so far

| Phase | What exists                                                                                                           | State                           |
| ----- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1     | `constants.ts`, `types.ts`, `endpoints.ts`                                                                            | Done                            |
| 2     | `form-data.ts`, `mapper.ts`, `registration.service.ts` (8 writes, 6 reads)                                            | Done                            |
| 3     | `steps.ts`, registration context/provider/hook, `/register/:step` routing, guards, progress bar, conditional NRI step | Done                            |
| 4     | `AccountStepPage.tsx` integrated into the wizard                                                                      | Implemented; prior checks passed |
| 5     | `NriStepPage.tsx`                                                                                                     | Implemented; prior checks passed |
| 6     | Basic details form, section submit, and master data                                                                   | Implemented; typecheck/lint/build pass |
| 7     | Contact, education, family, horoscope, partner, readback and review forms                                             | Implemented; typecheck/lint/build pass |

Current step order: **account → nri (only for `profile_location_type=NRI`) →
basic → contact → education → family → horoscope → partner → review**. Account
back navigation returns to `/welcome`.

The wizard shell is `pages/RegistrationWizardPage.tsx`; the remaining sections
share `pages/SectionStepPage.tsx` and the final review uses the existing GET
methods. Master-data key mappings outside the live-verified table remain subject
to live verification.

### Account step contract corrections

The first live attempt failed with:

```json
{
  "status": "error",
  "message": "Invalid child acceptance value, Middle name must contain only letters"
}
```

Corrections now in the page:

- `dob` is the **day of month as a string** (`"01"`), not a full date. Month is
  sent separately as `dobMonth` (1–12), year as `dobYear`.
- `countrycode` is the **country ID** from `get-country-list.php`, not a dial
  code. India is id `99`; `+91` is only the display label.
- `Profilecreatedby` is the relation label from
  `get-profile-created_by-relations.php`; `Relation_id` is its id, except
  `Self`, which sends `0`.
- `maritalstatus` comes from `get-maritial_status-list.php` (API spelling:
  Unmarried, Divorced, Widower, Widowed, Awaiting Divorce, Seperated).
- `child_acceptance` is sent only by account creation (`register.php`), from
  `Do Not Accept Children | Boy Child | Girl Child | Both Boy and Girl Child`,
  defaulting to `Do Not Accept Children`. It is **not present in the Postman
  register sample**, but the live backend rejected the old payload with a child
  acceptance error, so a valid value is now sent. Basic editing must **not**
  send it: `update-basic-details.php` changes account fields and would otherwise
  overwrite a value the API does not expose for reading.
- `middle_name` is validated as letters only and omitted when blank.
- Children fields (`noofchildren`, `childrenstatus`) are shown and required only
  when a marital status is selected and is not `Unmarried`.
- Religion → caste → subcaste are dependent selects; changing a parent clears
  the children and reloads options.
- DOB year options come from `get-year-list.php`; month options are local;
  validation rejects invalid/future dates and anyone under 18.
- Account creation calls `register.php`, adopts the returned `MatriID` through
  `AuthProvider.adoptSession`, persists the session, sets
  `profile_location_type`, saves the draft, and moves to the next visible step.

### NRI step contract

- Write endpoint: `update-nri-details.php`. No prefill/read.
- `nri_type`: NRI, OCI, PIO, Foreign Citizen.
- `nri_residency_status`: Resident, Non-Resident (contract values, not the
  `get-residency-list.php` values Citizen/Permanent Resident).
- `nri_visa_type`: Work, Student, Dependent, Business, Other, Not Applicable.
- `nri_willing_to_relocate`: Yes, No, Depends.
- `nri_settlement_preference`: India, Abroad, Undecided.
- `nri_visa_expiry` is required unless visa type is `Not Applicable`.
- Current/preferred country use names from `get-country-list.php`
  (`nicename` with the phone-code suffix stripped).
- The step is only reachable when `profile_location_type` is `NRI`.

### Master data service

`services/master-data.service.ts` caches options and exposes
`MasterOption { value, label, id? }` loaders. Response shapes seen live (unless noted):

| Loader              | Endpoint                               | Response                                               |
| ------------------- | -------------------------------------- | ------------------------------------------------------ |
| `countries()`       | `get-country-list.php`                 | `{ id, phonecode, nicename }`                          |
| `relations()`       | `get-profile-created_by-relations.php` | `{ id, relation }`                                     |
| `maritalStatuses()` | `get-maritial_status-list.php`         | `{ id, status, category_id }`                          |
| `religions()`       | `get-religion-list.php`                | `{ id, religion }`                                     |
| `castes(religion)`  | `get-caste-list.php?religion=`         | `{ id, caste, religion }`                              |
| `subcastes(caste)`  | `get-subcaste-list.php?caste=`         | `{ id, subcast, caste, religion }`                     |
| `days()`            | `get-day-list.php`                     | `{ id, day }` — one probe timed out; still unconfirmed |
| `years()`           | `get-year-list.php`                    | `{ id, year }` (from 1950)                             |
| `residencies()`     | `get-residency-list.php`               | `{ id, residency_status }`                             |
| `states(country)`   | `get-state-list.php?country=`          | `{ id, state }`                                        |
| `districts(state)`  | `get-district-list.php?state=`         | `{ id, dist }`                                         |
| `cities(district)`  | `get-city-list.php?district=`          | `{ id, city }`                                         |
| `talukas(district)` | `get-taluka-list.php?district=`        | `{ id, ... }`                                          |
| `brothers()`        | `get-no_of_brother-list.php`           | `{ id, number }`                                       |
| `familyWealth()`    | `get-family_wealth-list.php`           | `{ id, wealth }`                                       |

Methods also exist for the remaining Master Data GETs (education,
occupation, income, employed-in, blood group, complexion, special case, family
values/type/status, mother tongue, nakshatra, gothra, moon sign, manglik, shani,
horoscope match, calling time, siblings, birth AM/PM, IIT universities). **Only
the rows above have been live-verified.** Check the real key names before using
the rest — do not assume the guessed field names are correct.

### Files added or changed

Added:

```text
frontend/src/features/registration/
├── constants.ts
├── types.ts
├── endpoints.ts
├── form-data.ts
├── mapper.ts
├── steps.ts
├── context/registration-context.ts
├── context/RegistrationProvider.tsx
├── hooks/useRegistration.ts
├── services/registration.service.ts
├── services/master-data.service.ts
├── pages/RegistrationWizardPage.tsx
├── pages/AccountStepPage.tsx
├── pages/NriStepPage.tsx
├── pages/BasicStepPage.tsx
└── pages/SectionStepPage.tsx
frontend/src/components/ui/SelectField.tsx
```

Modified: `frontend/src/app/router.tsx`, `frontend/src/config/routes.ts`,
`frontend/src/features/auth/context/AuthProvider.tsx`,
`frontend/src/features/auth/context/auth-context.ts`,
`frontend/src/features/auth/services/auth.service.ts`.

`frontend/src/features/auth/pages/RegisterPage.tsx` is the unused old shell; do
not wire it into the flow without deciding to remove or repurpose it.

### Session and draft behaviour

- Registration draft lives in `sessionStorage` under `shivaraj.registration`;
  the password is stripped before persistence.
- `RegistrationProvider` exposes `saveAccount`, `saveSection`, completion
  tracking and the active draft.
- The API has no token or usable cross-origin cookie; identity is the `MatriID`
  sent per request. Registration currently adopts the `MatriID` returned by
  `register.php` on the client.
- Section writes call their `update-*` endpoint. Basic/contact/education/family/
  horoscope/partner read methods are used to prefill empty drafts and populate
  the review summary. NRI has no read method.
- `saveSection` merges the incoming fields into the existing draft section.
  Section editors track which fields came from the API (`known`) or the user
  (`dirty`) and submit only those plus required fields. This avoids sending blank
  values for fields the read endpoint does not expose.
- The Basic step now edits account fields through `update-basic-details.php`
  (full name, DOB, gender, created-by, marital/children, religion/caste,
  email/mobile, about-us and physical details). It deliberately omits
  `child_acceptance`. The 20-character about-us rule is relaxed only when the
  loaded value is itself shorter, so existing data is not blocked from saving.
- The read endpoints restore horoscope Gan/Nadi to canonical values (`Dev`,
  `Manushya`, `Rakshas`; `Adi`, `Madhya`, `Antya`) while displaying the existing
  labels. Legacy values such as `Adhya` and `Dev Gan` are normalised on read.

### Pending

1. Live-verify Basic account editing through `update-basic-details.php`
   (name, DOB, email, mobile) and confirm `child_acceptance` stays untouched.
   Read-only checks show the form prefills from `get-basic-details.php`, but
   no Basic write has been made.
2. Verify all master-data row keys against live responses. The collection
   documents request fields but does not include response samples for many of
   these lists, especially education, occupation, income, blood group, family,
   horoscope and partner options.
3. Replace the remaining comma-separated text inputs in family and partner
   preference with real multi-selects where the UI allows it; the API examples
   encode those values as comma-separated strings.
4. Review the generic section payloads against the Postman samples. Education
   now repeats saved basic fields, horoscope includes the optional file upload,
   and contact has country/state/district/city cascades; confirm each field and
   required rule before live submission.
5. Decide whether a final registration-completion API exists. The review page
   reads sections and shows a summary but deliberately does not submit or
   finalize anything.
6. Decide whether OTP (`send-otp.php` / `verify-otp.php`) belongs in the
   registration flow; it is not integrated.
7. Live-test each remaining `update-*` endpoint, including horoscope file
   upload and family `property_types` / `investment_types` arrays. During the
   Phase 2 audit the Horoscope and Family saves for `SM6990` reached the live
   API by mistake; read-back confirmed their values were unchanged, but both
   `Horodate` / `FamilyDate` were regenerated. Basic, contact, education,
   partner and register still need controlled write tests.
8. Confirm the exact success/error envelopes and `MatriID` shape; confirm
   whether `update-*` endpoints replace or merge fields. The two unintended
   writes did not settle this question because the submitted values matched the
   stored values.
9. Finish cleanup/QA: unused `RegisterPage`, browser back/refresh behaviour,
   mobile layout, and the two pre-existing lint warnings in `MatchesPage.tsx`
   and `ProfilePhotoProvider.tsx`.

Latest local verification in WSL: `npm run typecheck`, `npm run lint`, and
`npm run build` pass. Lint reports only the two existing warnings above;
production build reports the existing large-chunk warning. Run installs from
WSL too — a Windows `node_modules` has the wrong native bindings for WSL.

### Rules for the next agent

- Do not invent endpoints, response shapes or Master Data values. Use the
  collection and live GETs; fail loudly with `ApiNotIntegratedError` when a
  contract is unknown.
- Pages must not call axios; add methods to a feature service.
- Keep all route paths in `src/config/routes.ts`.
- Use English for UI chrome/toasts and Marathi only for content, per
  `AGENTS.md`.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` in `frontend/`
  from WSL after each phase. Current audit: all three pass; lint has only the
  two warnings noted above and the build has the existing large-chunk warning.

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

1. Finish the registration write flow: account, NRI and Basic account editing are
   implemented; contact, education, family, horoscope, partner and review still
   need final live verification.
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

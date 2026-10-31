# Test Report — Shivaraj Maratha PWA

Audit date: 2026-10-31.

## Result

| Check | Before fixes | After fixes |
|---|---|---|
| Browser suite, Chrome | 47 of 73 passed, 26 failed | **100 of 100 passed** |
| Registration and PWA tests (part of the 100) | 8 of 24 passed | 24 of 24 passed |
| Key journeys, Firefox | Not run | 15 of 15 passed |
| Key journeys, WebKit | Not run | 15 of 15 passed |
| Key journeys, touch emulation | Not run | 15 of 15 passed |
| Demo checkout on a demo-flag build | Not run | Passed |
| Accessibility scan, 15 screens, WCAG A/AA (axe) | 3 rules failing | 1 rule failing, 1 element |
| Typecheck | Pass | Pass |
| Lint | 7 warnings, 0 errors | 7 warnings, 0 errors (same ones) |
| Production build | Pass | Pass |
| Backend tests | 4 of 4 | 4 of 4 |
| `npm audit --omit=dev` | 1 High | 0 |
| `composer audit` | 1 Medium | 0 |

## The main limit: signed-in flows ran against a mock

No test account was available, and the live API has no staging copy. **All signed-in testing used a local mock of the API, not the real server.** The mock's response shapes were built from `CONTEXT.md` and the service code.

A pass therefore proves the app behaves correctly against those shapes, not that the live server sends them. BUG-001 in particular relies on the live section endpoints returning the keys the code labels (`Mobile`, `Email` and so on). The code strongly implies they do, but a member should confirm it once on a real account.

## Production safety

- **No writes or logins reached production.** The test browser intercepted every non-localhost request.
- The only live traffic was anonymous GETs of public dropdown lists and membership plans. No member data was requested. Firefox and WebKit test browsers were installed to `%LOCALAPPDATA%\ms-playwright`, outside the project.
- `C:tempsvr-test.mjs` was not run. Only its first 60 lines were read, with the password masked.

## Method

- Production build served locally and driven in real Chrome (Playwright) at 390×844.
- Stateful mock with controls for failures, delays, HTML responses and plan states.
- Each test asserts correct behaviour, so a baseline failure confirms a bug and the same test verifies its fix.
- `node_modules` in the project has WSL-only binaries, so lint and build ran in a scratch copy with Windows dependencies. The project's own `node_modules` was left alone.

## Live API check (read-only)

All 36 master-data lists returned the field names the app expects, including `get-day-list.php`, which `CONTEXT.md` listed as unconfirmed. This closes pending item 2 in that file. Dependent lists for caste, state, district, taluka and city also returned data; the country-to-state lookup needs the country name, which the Contact step sends.

## Coverage

| Module | Tests | Scenarios | Result |
|---|---|---|---|
| Auth | A1–A10 | Validation, wrong password, login by ID and mobile, guards, deep link, logout, timeout, forgot password, HTML response, corrupt session | Pass |
| Dashboard and navigation | B1–B10 | Placeholder data, on-demand paging, total and partial failure, all nav routes, 404, legal pages, offline banner, 390px overflow on 18 screens | Pass |
| Search | C1–C9 | Defaults, reversed ranges, pagination, search during Load more, reset, empty, error and retry, cascades, payload, blurred photos | Pass |
| Profile detail and contact unlock | D1–D16 | Gated data, unknown and own profile, interest, view count, shortlist, unlock, plan states, expiry edge cases, server refusal, hostile input | Pass |
| Interests | E1–E7 | Lists, accept, decline, failure, page shift, profile link, dates, empty, retry | Pass |
| Shortlist, matches, views, contacts | F1–F5 | Tabs, rollback, infinite scroll, retry, empty states | Pass |
| Membership and own profile | G1–G9 | Plans, checkout, all sections, retry, upload guards, documents, biodata, editor payload, read-blocked save | Pass |
| Account step | H1–H10 | Empty and invalid input, 18-year boundary, impossible dates, duplicate email, success, refresh, NRI branch, step guards, review labels | Pass |
| Registration wizard | I1–I20 | Every step for Indian Resident and NRI, payloads, validation, cascades, family lists, horoscope file and birth time, partner ranges, resume, back, failed save, refresh, logout, profile editor saves | Pass |
| PWA | P1–P4 | Manifest and icons, offline shell, no API caching, offline login message | Pass |

## Baseline triage

Of the 26 baseline failures, 24 confirmed bugs. The other two were wrong selectors in my tests (G7, G8), corrected and rerun. G7 was also covering BUG-031, so that bug was not reproduced by test.

- D12 passed on the baseline falsely, because its text match hit "Renew your plan to view contact details". Tightening it exposed BUG-007.
- A6 was also polluted by my harness re-seeding the session. After correcting it, I confirmed the bug by turning the fix off for one run: the test failed, then passed with the fix restored.

## Not tested, and why

| Area | Reason |
|---|---|
| Real login and signed-in live data | No test credentials; the only password found was in a stray file and was not used |
| Live writes: register, `update-*`, uploads, interests, unlocks | Would change production data, and unlocks spend credits |
| Real payments | Razorpay is not connected |
| Forgot password live | It would send real email; the success response is still unconfirmed |
| How the live server stores wizard saves, including family list fields and replace-or-merge behaviour | Needs a live write; the mock accepts whatever is sent |
| Postman contract check | The collection is not on this computer |
| Real Android and iOS devices, real Safari | Only desktop browsers and emulation were available |
| Installing the PWA, and the "new version" prompt | Needs a real device and two deployed versions |
| Screen reader use and manual keyboard walkthrough | The axe scan catches only part of accessibility |
| Load testing | Would stress the production server |

## Known limits of this run

- G2 fails on the demo build by design: it asserts the production checkout, and the demo flag replaces it. G9 is a no-op without the flag, so in the 100/100 run it passes without checking anything. It really ran only on the demo build.
- G9 hung once for about 10 minutes in a demo run that followed a reinstall. It passed in two reruns (7 s alone, 6 s after the full G group). The cause was not identified; the evidence points at the harness.
- The rerun of `npm ci` over the scratch folder printed an error. Clean installs in fresh folders succeed with both the new and original lockfile.

- The 15 cross-browser journeys are a subset, not the full suite.
- Round two's I2 and P1–P4 first failed for test reasons or because of BUG-047. I2 had a hidden `<option>` selector problem, corrected and rerun.

## Rerun

The test kit and raw results are in `docs/qa/`, which git ignores: `mock-api.mjs`, `e2e.mjs`, `a11y.mjs`, `run.sh`, `master-check.mjs`, and the JSON results (`baseline-full`, `reg-baseline`, `final-1`, `final-2`). `run.sh` has paths from this session and needs its `S=` line changed.

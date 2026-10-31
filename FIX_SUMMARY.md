# Fix Summary — Shivaraj Maratha PWA

Audit date: 2026-10-31. 40 of 56 issues fixed. **Nothing is committed.** All changes sit in the working tree on top of your existing uncommitted work.

Scope: about 35 frontend source files across both rounds, `frontend/package-lock.json`, `backend/composer.lock`. No endpoints, routes or dependencies were added, and no new architecture.

## Fixes

| Bug | Fix | Files | Test |
|---|---|---|---|
| BUG-001 Critical | Public profiles now show only labelled fields, and never the keys sold through the contact unlock (name, DOB, email, mobile, parents, birth place and time, horoscope file). New API fields stay hidden until someone adds a label. | `public-profile.service.ts` | D1, D16 |
| BUG-003 High | The add-or-remove decision now reads a ref, not a value assigned inside a state updater, which React may run later. | `ShortlistProvider.tsx` | D6, D7 |
| BUG-004, 013 | Placeholder announcements removed from real builds. If all six lists fail, the dashboard shows its error state; one failed list leaves that rail empty. | `dashboard.service.ts` | B1, B3, B10 |
| BUG-005 High | The rail's scroll sentinel now sits inside the rail and watches sideways scrolling only. An empty rail starts from page 1 instead of skipping it. | `InfiniteProfileCarousel.tsx` | B2, B9, B10 |
| BUG-006 High | A date-only expiry now runs to the end of that day. | `dates.ts` | D11 |
| BUG-007, 016 High, Medium | Only a known past expiry locks contacts; an unreadable date leaves the decision to the server. The unlocked check runs first, so a failed plan lookup cannot hide paid contacts. | `ContactDetailsSection.tsx` | D12, D13 |
| BUG-008, 017 High, Medium | After an accept or decline, the loaded pages are re-read, and answered IDs stay filtered out. | `InterestsPage.tsx` | E3, E4 |
| BUG-011 | The guard keeps the path and query. Welcome passes it on and login returns there. Only internal paths are accepted. | `routes.ts`, `guards.tsx`, `WelcomePage.tsx`, `LoginPage.tsx` | A5 |
| BUG-012 | A new search clears the superseded Load more state. | `SearchPage.tsx` | C4 |
| BUG-014 | All failure tokens are recognised, and a response without an identity is an error. | `public-profile.service.ts` | D2 |
| BUG-015 | Interest and shortlist actions are hidden on your own profile. | `ProfileDetailPage.tsx` | D3 |
| BUG-018, 025 | Interest rows link to the profile; dates use the shared parser. | `InterestRow.tsx` | E5, E6 |
| BUG-019 | Failed match pages show the error and Retry. | `MatchesPage.tsx` | F3 |
| BUG-020 | Logout removes that member's cached shortlist; it rehydrates from the server at next sign-in. | `ShortlistProvider.tsx` | A6 |
| BUG-021 | Production checkout offers a call to the centre and no longer implies payment. | `CheckoutSheet.tsx` | G2 |
| BUG-022, 023 | Separate messages for timeout, server unreachable and offline. A non-JSON login response is no longer called a wrong password. | `api-error.ts`, `auth.service.ts` | A7, A9 |
| BUG-024 | `follow-redirects` 1.16.2, `symfony/mime` 7.4.22, plus two other transitive patches from `npm audit fix`. | Lockfiles | Audits |
| BUG-026, 030, 031, 038 | Income label, empty-file rejection, pop-up detection, readable review labels, plan title. | `profile.service.ts`, `profile-upload.service.ts`, `ProfileBiodataPage.tsx`, `SectionStepPage.tsx`, `ProfileMembershipPage.tsx` | G3, G6, G7, H9 |

## Round two: registration, PWA, accessibility

| Bug | Fix | Files | Test |
|---|---|---|---|
| BUG-039 High | The birth-time parser accepts a colon before AM/PM. | `SectionStepPage.tsx` | I12 |
| BUG-040 High | Blank repeated Basic fields are no longer sent from Education. | `SectionStepPage.tsx` | I9 |
| BUG-041 High | Saved castes are kept when the caste list comes back empty. | `SectionStepPage.tsx` | I15 |
| BUG-042 | Horoscope files use the shared 5 MB, PDF-or-image check, and file saves get a 60-second timeout. | `SectionStepPage.tsx`, `profile-upload.service.ts`, `registration.service.ts` | I13 |
| BUG-043 | India needs 10 digits; other countries allow 6 to 15. | `constants.ts`, `AccountStepPage.tsx`, `BasicStepPage.tsx` | I4 |
| BUG-044 | Children status appears and is required only when there are children. | `AccountStepPage.tsx`, `BasicStepPage.tsx` | I5 |
| BUG-045 | The letters-only rule applies only to a name being typed. | `BasicStepPage.tsx` | I6 |
| BUG-046, 048 | Edited phone numbers are checked; partner height and income ranges are checked. | `SectionStepPage.tsx` | I7, I14 |
| BUG-047 | The service worker now registers at app level. | `App.tsx`, `AppLayout.tsx` | P1–P4 |
| BUG-049 | Visa expiry must be a real YYYY-MM-DD date; none is sent for Not Applicable. | `NriStepPage.tsx` | I3 |
| BUG-056 | The form grid can no longer widen past the card, and long file names wrap. | `SectionStepPage.tsx` | Width checks, G8, I-series |
| BUG-050 | Back goes to the dashboard on the first step after the account. | `RegistrationWizardPage.tsx` | I16 |
| BUG-051 | File input labels, focusable legal pages, darker Accept button. | Photos, Documents, Biodata, legal pages, `InterestsPage.tsx` | axe scan |

## Verification

Run on the final code from a dependency set matching the updated lockfile.

| Check | Result |
|---|---|
| Browser suite, Chrome | 100 of 100 passed |
| Firefox, WebKit, touch emulation | 15 of 15 passed on each |
| Demo checkout, G9, on a demo-flag build | Passed |
| Typecheck, build | Pass |
| Lint | 7 warnings, unchanged, none new |
| Clean `npm ci` from the new lockfile | Pass |
| Backend tests | 4 of 4 |
| npm production audit, composer audit | 0 advisories |

Signed-in behaviour was verified against a local mock, not the live API. See `TEST_REPORT.md`.

## Behaviour changes to review

- **Own profile shows less at `/profiles/<own id>`.** The same filter applies, so a member sees their full details under My Profile only.
- **Horoscope file is now hidden from public profiles.** I treated it as gated because it carries birth details. Remove it from `PLAN_GATED_KEYS` if it should stay public.
- **Unlabelled API fields no longer appear** on public profiles. Any legitimate field missing from `LABELS` will disappear until labelled.
- **Unknown expiry now allows an unlock attempt.** The server remains the final authority.
- **Server rules may be stricter than the form now is.** Overseas mobiles, children status left blank, and re-saved Marathi names now reach the server. If it rejects them, the member sees its message.
- **Horoscope uploads are PDF or image only**, a limit I chose to match biodata. Other formats need adding to `HOROSCOPE_FILE_TYPES`.
- **Answering an interest makes extra requests** when more pages exist, one per loaded page.
- `ProfileDetailPage.tsx` and `InterestRow.tsx` were run through Prettier, so their diffs include small formatting changes to nearby lines.

## Left unchanged on purpose

- `C:tempsvr-test.mjs` and `.env.production.local` (BUG-009, BUG-010): these need your decision.
- `CONTEXT.md`: its pending items and maturity table are now partly out of date, for example master-data verification and "Profile detail ⚠️ Partial".
- `frontend/node_modules`: it still has WSL binaries, so run `npm ci` in WSL to pick up the lockfile patches.

## Next steps, by priority

1. Add real server-side authentication and stop returning private fields (BUG-002). Until then, the privacy fix is display-only.
2. Delete the stray script, change its password, and check production for `svrtest` accounts (BUG-009).
3. Set preview to `false` before any release build (BUG-010).
4. Using a real test account, confirm BUG-001, BUG-029, BUG-039, BUG-040 and BUG-053, and check each new form rule above.

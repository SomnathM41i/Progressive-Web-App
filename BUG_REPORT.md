# Bug Report — Shivaraj Maratha PWA

Audit date: 2026-10-31. Method and coverage are in `TEST_REPORT.md`; code changes are in `FIX_SUMMARY.md`.

**Totals: 56 issues — 40 fixed, 16 open.** The second round covered the full registration wizard, PWA, accessibility and other browsers; BUG-039 onward came from it.

| Severity | Total | Fixed | Open |
|---|---|---|---|
| Critical | 2 | 1 | 1 |
| High | 11 | 9 | 2 |
| Medium | 27 | 23 | 4 |
| Low | 16 | 7 | 9 |

"Test" names the browser test that proves the bug and the fix (`docs/qa/e2e.mjs`). "Code review" means the issue was found by reading code or configuration and has no browser test.

---

## Open issues that need a decision

### BUG-002 — Critical — Open — Legacy API trusts any MatriID

- **Module:** Legacy PHP API (server side)
- **Issue:** The API has no token or cookie. Identity is just the `MatriID` in the request, and the frontend's session exists only in the browser. Section endpoints are called with another member's ID, and the code's field labels show they return that member's mobile, email and DOB.
- **Steps:** Send `POST /get-basic-details.php` with any `MatriID`.
- **Expected:** The server identifies the caller and refuses or filters private data.
- **Actual (from code):** Nothing in the request can identify the caller, so the server cannot enforce who may read or change what. The same applies to `update-*`, `send-interest` and `ViewUserContactDetails`.
- **Status:** Open. It cannot be fixed in this repository. BUG-001 only stops the app displaying the data; it still travels in the network response.
- **Not live-tested:** Probing it would mean reading real members' private data.

### BUG-009 — High — Open — Password file and live test script in the project root

- **Module:** Repository
- **Issue:** `C:tempsvr-test.mjs` holds a plaintext password. It also drives registration against the running app with generated `somnath.malim46+svrtest…@gmail.com` accounts, so any past runs may have left test profiles on the live site.
- **Expected:** No credentials in the project folder, and no test accounts in production.
- **Actual:** The file is present. It is not tracked by git. It was not run or modified during this audit.
- **Status:** Open. Delete the file, change that password anywhere it is used, and check production for `svrtest` accounts.

### BUG-010 — High — Open — Local builds ship the placeholder preview

- **Module:** Build configuration
- **Issue:** `frontend/.env.production.local` sets `VITE_ENABLE_DEV_PREVIEW=true`, which overrides the committed `.env.production`.
- **Steps:** Run `npm run build` on this machine.
- **Expected:** A production build has preview off.
- **Actual:** The build is produced with preview on. `CONTEXT.md` says this must never be on in a real release.
- **Status:** Open. The file may be intentional for a demo deployment, so it was left unchanged. Set it to `false` before any real release build.

### BUG-027 — Medium — Open — Members are signed out whenever the app is closed

- **Module:** Auth
- **Issue:** The session is in `sessionStorage`, which is cleared when the tab or installed PWA closes.
- **Expected:** An installed app normally stays signed in.
- **Actual:** Members log in again on every launch, and a new tab is also signed out.
- **Status:** Open, product decision. Moving it to `localStorage` makes BUG-002 easier to exploit on a shared device.

### BUG-028 — Medium — Open — Membership cannot be bought online

- **Module:** Membership
- **Issue:** The Razorpay order and verification endpoints do not exist yet.
- **Status:** Open, needs server work. BUG-021 removed the dead end by offering a call to the centre.

### BUG-029 — Medium — Open, unverified — List rows may bypass photo approval

- **Module:** Interests, Shortlist
- **Issue:** These lists fall back to the raw `Photo1` field. Comments elsewhere in the code say raw photo fields ignore photo approval.
- **Status:** Open. Needs one check against real data. Search and profile views already handle this.

### BUG-053 — Medium — Open, unverified — NRI visa values may not match the API

- **Module:** Registration, NRI step
- **Issue:** The form sends `Work Visa`, `Student Visa`, `Dependent Visa` and `Business Visa`. `CONTEXT.md` lists the contract values as `Work`, `Student`, `Dependent` and `Business`.
- **Expected:** The form sends the values the API accepts.
- **Actual:** The two sources disagree. The Postman collection that would settle it is not at the path `CONTEXT.md` gives, or in Downloads.
- **Status:** Open. Left unchanged, because the right value cannot be confirmed without the collection or one live test.

### Low severity

| ID | Module | Issue | Why open |
|---|---|---|---|
| BUG-032 | Toasts | An error toast sits over the main button at phone size, and a resting mouse pauses it, so the button stays covered. Found by test A8. | Moving toasts is a design decision |
| BUG-033 | Notifications, Browse | Placeholder screens show developer wording ("once the API collection is connected"). | Copy decision; the features do not exist yet |
| BUG-034 | Login | Passwords are trimmed, so a website password with outer spaces cannot log in here. | Needs the website's password rule |
| BUG-035 | Profile cards | A photo that fails to load shows a broken image, not the avatar. Code review. | Cosmetic |
| BUG-036 | Performance | One JS bundle over 500 kB with no code splitting; 1.5 MB precached. | Refactor, out of scope |
| BUG-037 | Tooling | No frontend tests in the repo; 62 files fail Prettier; 7 lint warnings; 10 npm audit advisories (2 low, 8 moderate) need breaking upgrades, and production dependencies are clean. | Maintenance |
| BUG-052 | Accessibility | One grey text on the photos screen has low contrast (`#777078` on `#f4f0ef`). | It is a site-wide colour token; changing it is a design decision |
| BUG-054 | Registration, Partner | Adding a second state clears selected districts, talukas and cities. Code review. | Needs a decision on how a multi-select cascade should behave |
| BUG-055 | PWA | `useInstallPrompt` is unused, so the app has no install button; members rely on the browser's own prompt. Code review. | Feature decision |

---

## Fixed issues

Each row gives what a member experienced before the fix. The expected result is the opposite unless stated.

### Critical

| ID | Module | Issue and reproduction | Test |
|---|---|---|---|
| BUG-001 | Profile detail | Plan-gated data was free. Open any profile with no plan: mobile, email, DOB, full name, parents' names and birth place/time all appeared under the sections, while Contact details said "locked". | D1 |

### High

| ID | Module | Issue and reproduction | Test |
|---|---|---|---|
| BUG-003 | Shortlist | Tap shortlist on, then off: the second tap sent **add** again (`add=2 remove=0`). The app showed it removed but the server kept it, so it came back on reload. | D6 |
| BUG-004 | Dashboard | Real members saw invented announcements, including "24 new profiles were added this week". | B1 |
| BUG-005 | Dashboard | Opening the dashboard downloaded rail pages one after another without any scrolling: 6 requests for page 3+ within seconds, wasting mobile data and loading the server. | B2 |
| BUG-006 | Contact details | A plan was treated as expired from midnight on its last valid day, so a paying member was told to renew. | D11 |
| BUG-007 | Contact details | A plan with an unreadable expiry date was told "Your membership is not active". Hidden on the baseline by a loose test match; found during triage. | D12 |
| BUG-008 | Interests | Answering all 10 interests on page 1 showed "No received interests" while 4 more were waiting. | E3 |
| BUG-039 | Horoscope | A saved `:5:45:PM` birth time loaded as 5:45 AM, and saving wrote the wrong time back. The format comes from a comment in the contact service; `BirthTime` itself was not seen live. | I12 |
| BUG-040 | Registration, Education | A member resuming this step, whose browser draft had no Basic section, sent blank height, weight, blood group, complexion and about-us. Whether the server overwrites with blanks is unconfirmed. | I9 |
| BUG-041 | Partner preference | If the caste list failed to load, saved castes were silently cleared and saved as blank. | I15 |

### Medium

| ID | Module | Issue and reproduction | Test |
|---|---|---|---|
| BUG-011 | Auth | Opening a deep link signed out, then logging in, always landed on the dashboard. | A5 |
| BUG-012 | Search | Running a new search during Load more left Load more disabled for good. | C4 |
| BUG-013 | Dashboard | If every profile list failed, the dashboard was silently blank. | B3 |
| BUG-014 | Profile detail | An unknown ID returning `status: failed` showed a blank "ghost" profile and recorded a view. | D2 |
| BUG-015 | Profile detail | On your own profile you could send yourself an interest and shortlist yourself. | D3 |
| BUG-016 | Contact details | A failed plan lookup hid contacts the member had already paid for. | D13 |
| BUG-017 | Interests | After answering one interest, Load more skipped a person, because server pages shift. | E4 |
| BUG-018 | Interests | Rows had no link, so a member had to accept or decline without seeing the profile. | E5 |
| BUG-019 | Matches | A failed next page silently ended the list. It now shows the error and a Retry button. | F3 |
| BUG-020 | Auth | Shortlisted names and photos stayed in `localStorage` after logout on a shared device. | A6 |
| BUG-021 | Membership | In production, "Choose plan" led to a dead end titled "Complete your payment" with no way to buy. | G2 |
| BUG-022 | Errors | A slow server was reported as "You appear to be offline". | A7 |
| BUG-023 | Auth | A server fault during login was reported as "Invalid username or password". | A9 |
| BUG-042 | Horoscope upload | Any file was accepted, including `.exe`, with no size limit and the 15-second timeout. | I13 |
| BUG-043 | Registration | Every country required exactly 10 digits, so an overseas member with a 9-digit number could not register. | I4 |
| BUG-044 | Registration | A divorced member with 0 children had to choose a children status. | I5 |
| BUG-045 | Profile editor | A member with a saved Marathi name could not save Basic details ("Use letters only"). | I6 |
| BUG-046 | Registration, Contact | `not-a-phone` was accepted as a mobile number. | I7 |
| BUG-047 | PWA | The service worker started only after login, so signed-out visitors had no offline support. | P1–P4 |
| BUG-048 | Partner preference | Minimum height or income above the maximum could be saved. | I14 |
| BUG-049 | Registration, NRI | "next year" was accepted as a visa expiry, and an old date was still sent after choosing Not Applicable. | I3 |
| BUG-056 | Profile editor, Horoscope | With a long horoscope file name at phone width, the form stretched to 553px and every field ran off the card. Reported by you at `/profile/edit?section=horoscope`. | Measured at 320, 390 and 1280px |
| BUG-024 | Dependencies | `follow-redirects` (High advisory, no browser exposure, so rated Medium here) and `symfony/mime` (Medium). Both patched. | npm and composer audit |

### Low

| ID | Module | Issue and reproduction | Test |
|---|---|---|---|
| BUG-025 | Interests | `09-03-2026` displayed as 3 September. | E6 |
| BUG-026 | Own profile | Annual income showed the raw `500000`, not `5 Lakh`. | G3 |
| BUG-030 | Uploads | Empty 0-byte files were sent to the server. | G6 |
| BUG-031 | Biodata | "Allow pop-ups" appeared every time, even when the file opened. Fixed in code and passing, but the test's selector was also wrong on the baseline, so the bug itself was not reproduced by test. | G7 |
| BUG-050 | Registration | Back on the first step after creating an account did nothing. It now goes to the dashboard. | I16 |
| BUG-051 | Accessibility | Four file inputs had no label, legal pages could not be scrolled by keyboard, and the Accept button failed contrast. | axe scan |
| BUG-038 | Registration, Membership | Review showed raw keys such as `terms_accepted` and `regno`; the membership page showed the plan as `(6)Months`. | H9 (plan name: code review) |

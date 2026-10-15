# AGENTS.md

Project instructions for coding agents working on the Shivaraj Maratha PWA
(React + TypeScript frontend in `frontend/`, Laravel 12 backend in `backend/`).

## Language convention

Use **English** for all UI chrome and developer-facing text. Use **Marathi**
(Devanagari) only for genuine Marathi content.

- **English**: toast messages, button labels, form labels, placeholders,
  headings, navigation items, validation/error messages, code identifiers,
  comments, commit messages, and docs prose.
- **Marathi**: only content that is meant to read as Marathi — the brand name
  ("शिवराज मराठा" / "वधू वर सूचक केंद्र"), taglines, and user/content data such as
  names, places, occupations, and announcements.

Examples:

- Toast: `toast.success('Logged in successfully')` — English.
- Button: `<Button>Login</Button>` — English.
- Field: `label="Mobile number or profile ID"` — English.
- Tagline: `const TAGLINE = 'योग्य नात्यांची विश्वासार्ह सुरुवात'` — Marathi.
- Preview data names/places: `'सोमनाथ माळी'`, `'सातारा'` — Marathi (content).

Do not translate UI chrome into Marathi, and do not romanise Marathi content
that is meant to stay in Marathi.

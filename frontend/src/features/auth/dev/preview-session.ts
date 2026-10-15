import type { AuthSession } from '@/features/auth/types'

/**
 * DEVELOPMENT ONLY.
 *
 * A stand-in session so the authenticated screens can be reviewed before the
 * API collection is integrated. Nothing here talks to a server and nothing here
 * is reachable in a production build — `env.devPreview` is hard-gated on
 * `import.meta.env.DEV`.
 *
 * Delete this module once real authentication is wired up.
 */
export const PREVIEW_SESSION: AuthSession = {
  user: {
    id: 'preview-user',
    name: 'सोमनाथ माळी',
    profileId: 'SM008656',
    email: 'preview@shivarajmaratha.com',
    phone: '+91 94035 50087',
    avatarUrl: null,
  },
}

export const PREVIEW_SESSION_KEY = 'shivaraj.preview-session'

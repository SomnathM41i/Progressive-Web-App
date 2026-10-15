import { env } from '@/config/env'
import {
  PREVIEW_SESSION,
  PREVIEW_SESSION_KEY,
} from '@/features/auth/dev/preview-session'
import type {
  AuthService,
  AuthSession,
  LoginCredentials,
} from '@/features/auth/types'
import { sessionStore } from '@/lib/storage'
import { ApiNotIntegratedError } from '@/services/api-error'

/**
 * Real implementation.
 *
 * The API collection is not available yet, so restoring a session always
 * resolves to "signed out" and signing in fails loudly. It deliberately does
 * not fabricate a successful login.
 *
 * When the collection is ready, replace the bodies with calls through the
 * shared `api` client. The surrounding app does not need to change.
 */
const unconfiguredAuthService: AuthService = {
  async restoreSession(): Promise<AuthSession | null> {
    // TODO(api): GET the current session and map the response to AuthSession.
    return null
  },

  async login(_credentials: LoginCredentials): Promise<AuthSession> {
    throw new ApiNotIntegratedError('Sign in')
  },

  async logout(): Promise<void> {
    // TODO(api): POST to the logout endpoint and clear any stored token.
  },
}

/**
 * Development-only implementation.
 *
 * Lets the authenticated experience be reviewed without a backend. The session
 * is kept in sessionStorage so signing out survives a refresh, which makes the
 * unauthenticated screens easy to check too.
 */
const previewAuthService: AuthService = {
  async restoreSession(): Promise<AuthSession | null> {
    return sessionStore.read(PREVIEW_SESSION_KEY) ? PREVIEW_SESSION : null
  },

  async login(): Promise<AuthSession> {
    sessionStore.write(PREVIEW_SESSION_KEY, '1')
    return PREVIEW_SESSION
  },

  async logout(): Promise<void> {
    sessionStore.remove(PREVIEW_SESSION_KEY)
  },
}

export const authService: AuthService = env.devPreview
  ? previewAuthService
  : unconfiguredAuthService

/** True when the running build is using the development preview session. */
export const isPreviewAuth = env.devPreview

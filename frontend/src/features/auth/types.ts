/**
 * Authentication contracts.
 *
 * The API collection has not been integrated yet, so these types describe only
 * what the UI genuinely needs. They are expected to be reconciled with the real
 * API resources once the collection is available — see docs/api-integration.md.
 */

export interface AuthUser {
  id: string
  /** Full name as it should be displayed. */
  name: string
  avatarUrl?: string | null
  /** Public profile identifier, e.g. `SM008656`. */
  profileId?: string
  email?: string | null
  phone?: string | null
}

export interface AuthSession {
  user: AuthUser
  /** Bearer token when the API uses token auth. Omitted for cookie sessions. */
  token?: string
  expiresAt?: string
}

/**
 * Provisional shape for the sign-in request.
 *
 * It exists so the login form has a typed boundary to call. The field names
 * must be aligned with the API collection before this is wired up.
 */
export interface LoginCredentials {
  identifier: string
  password: string
}

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

export interface AuthService {
  /** Resolves the persisted session, or `null` when there is none. */
  restoreSession: () => Promise<AuthSession | null>
  login: (credentials: LoginCredentials) => Promise<AuthSession>
  logout: () => Promise<void>
}

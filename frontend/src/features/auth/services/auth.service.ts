import { env } from '@/config/env'
import type { AuthService, AuthSession, LoginCredentials } from '@/features/auth/types'
import { sessionStore } from '@/lib/storage'
import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

/**
 * Real authentication against the PHP API (`{VITE_API_BASE_URL}/login.php`).
 *
 * The API answers with `{ status, message, data }` and uses HTTP 200 even for
 * failures, so success is decided by the `status` field rather than the status
 * code. The session is held client-side: the API sets no usable cookie for a
 * cross-origin SPA and returns no token, so the signed-in user is persisted in
 * sessionStorage and cleared on sign-out.
 */

const SESSION_KEY = 'shivaraj.session'

interface LoginResponse {
  status: 'success' | 'error'
  message: string
  data?: {
    MatriID: string
    Name: string
    Email?: string | null
    Mobile?: string | null
  }
}

/**
 * Reads the API's `status` field tolerantly.
 *
 * The backend answers HTTP 200 even for failures, and the exact positive value
 * has only ever been observed as `success`; `Success` and `1` are treated the
 * same so a casing or numeric variant does not lock a valid member out.
 */
function isSuccess(status: unknown): boolean {
  if (status === 1 || status === true) return true
  if (typeof status === 'string') {
    const normalised = status.trim().toLowerCase()
    return normalised === 'success' || normalised === '1' || normalised === 'ok'
  }
  return false
}

/** True when a parsed value looks like a usable persisted session. */
function isValidSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) return false
  const user = (value as { user?: unknown }).user
  if (typeof user !== 'object' || user === null) return false
  const profileId = (user as { profileId?: unknown }).profileId
  return typeof profileId === 'string' && profileId.trim().length > 0
}

function persist(session: AuthSession | null): void {
  if (session) {
    sessionStore.write(SESSION_KEY, JSON.stringify(session))
  } else {
    sessionStore.remove(SESSION_KEY)
  }
}

function buildSessionFromProfile(input: {
  matriId: string
  name?: string | null
  email?: string | null
  phone?: string | null
}): AuthSession {
  const matriId = input.matriId.trim()
  const name = input.name?.trim() || 'Member'

  return {
    user: {
      id: matriId,
      name,
      profileId: matriId,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
    },
  }
}

const authServiceImpl: AuthService = {
  async restoreSession(): Promise<AuthSession | null> {
    const raw = sessionStore.read(SESSION_KEY)
    if (!raw) return null

    try {
      const parsed: unknown = JSON.parse(raw)
      if (!isValidSession(parsed)) {
        sessionStore.remove(SESSION_KEY)
        return null
      }
      return parsed
    } catch {
      sessionStore.remove(SESSION_KEY)
      return null
    }
  },

  async login({ identifier, password }: LoginCredentials): Promise<AuthSession> {
    const trimmedIdentifier = identifier.trim()
    const trimmedPassword = password.trim()

    const body = new URLSearchParams({
      username: trimmedIdentifier,
      password: trimmedPassword,
    })
    const { data } = await api.post<LoginResponse>('/login.php', body)

    if (!isSuccess(data.status) || !data.data) {
      throw new ApiError({
        message: data.message || 'Invalid username or password',
      })
    }

    const matriId =
      typeof data.data.MatriID === 'string' ? data.data.MatriID.trim() : ''
    const name = typeof data.data.Name === 'string' ? data.data.Name.trim() : ''

    if (!matriId) {
      throw new ApiError({
        message: data.message || 'Login succeeded but the profile id was missing.',
      })
    }

    const session = buildSessionFromProfile({
      matriId,
      name,
      email: data.data.Email ?? null,
      phone: data.data.Mobile ?? null,
    })

    persist(session)
    return session
  },

  async logout(): Promise<void> {
    persist(null)
  },
}

export const authService: AuthService = authServiceImpl
export { buildSessionFromProfile, persist as persistAuthSession }

export { SESSION_KEY }

/** True when the running build is using development placeholder data. */
export const isPreviewAuth = env.devPreview

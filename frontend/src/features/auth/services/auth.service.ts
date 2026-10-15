import { env } from '@/config/env'
import type {
  AuthService,
  AuthSession,
  LoginCredentials,
} from '@/features/auth/types'
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

function persist(session: AuthSession | null): void {
  if (session) {
    sessionStore.write(SESSION_KEY, JSON.stringify(session))
  } else {
    sessionStore.remove(SESSION_KEY)
  }
}

const authServiceImpl: AuthService = {
  async restoreSession(): Promise<AuthSession | null> {
    const raw = sessionStore.read(SESSION_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw) as AuthSession
    } catch {
      sessionStore.remove(SESSION_KEY)
      return null
    }
  },

  async login({ identifier, password }: LoginCredentials): Promise<AuthSession> {
    const body = new URLSearchParams({ username: identifier, password })
    const { data } = await api.post<LoginResponse>('/login.php', body)

    if (data.status !== 'success' || !data.data) {
      throw new ApiError({
        message: data.message || 'Invalid username or password',
      })
    }

    const session: AuthSession = {
      user: {
        id: data.data.MatriID,
        name: data.data.Name,
        profileId: data.data.MatriID,
        email: data.data.Email ?? null,
        phone: data.data.Mobile ?? null,
      },
    }

    persist(session)
    return session
  },

  async logout(): Promise<void> {
    persist(null)
  },
}

export const authService: AuthService = authServiceImpl

/** True when the running build is using development placeholder data. */
export const isPreviewAuth = env.devPreview

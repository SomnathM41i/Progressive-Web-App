import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { AuthContext, type AuthContextValue } from '@/features/auth/context/auth-context'
import { authService, isPreviewAuth } from '@/features/auth/services/auth.service'
import type {
  AuthStatus,
  AuthUser,
  LoginCredentials,
} from '@/features/auth/types'
import { setAuthTokenProvider, setUnauthorizedHandler } from '@/services/api'

/**
 * Owns the authentication state for the whole app.
 *
 * This provider deliberately does not restore the session on mount. The startup
 * lifecycle (`useAppInitialization`) drives restoration so that the splash, the
 * session check and the router hand-off happen in one ordered sequence, and so
 * the session is only ever restored once. `restore` is exposed for the retry
 * path and for manual re-checks.
 *
 * The provider also tells the API client how to read the current token and what
 * to do on a 401, which keeps the client free of auth imports.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('unknown')
  const [user, setUser] = useState<AuthUser | null>(null)
  const tokenRef = useRef<string | null>(null)

  const applySession = useCallback((nextUser: AuthUser | null, token?: string) => {
    tokenRef.current = token ?? null
    setUser(nextUser)
    setStatus(nextUser ? 'authenticated' : 'unauthenticated')
  }, [])

  const restore = useCallback(async () => {
    const session = await authService.restoreSession()
    applySession(session?.user ?? null, session?.token)
  }, [applySession])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const session = await authService.login(credentials)
      applySession(session.user, session.token)
    },
    [applySession],
  )

  const logout = useCallback(async () => {
    await authService.logout()
    applySession(null)
  }, [applySession])

  useEffect(() => {
    setAuthTokenProvider(() => tokenRef.current)
    setUnauthorizedHandler(() => {
      tokenRef.current = null
      setUser(null)
      setStatus('unauthenticated')
    })

    return () => {
      setAuthTokenProvider(null)
      setUnauthorizedHandler(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, isPreview: isPreviewAuth, login, logout, restore }),
    [status, user, login, logout, restore],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

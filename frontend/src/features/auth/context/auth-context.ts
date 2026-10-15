import { createContext } from 'react'

import type { AuthStatus, AuthUser, LoginCredentials } from '@/features/auth/types'

export interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  /** True when the session comes from the development preview, not the API. */
  isPreview: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  restore: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

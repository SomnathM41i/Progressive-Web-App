import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { PageLoader } from '@/components/loading/PageLoader'
import { returnPath, routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * Guard for authenticated screens.
 *
 * Startup already waits for the session to settle, so the `unknown` branch is
 * only a safety net for a hard refresh that lands directly on a nested route.
 */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'unknown') {
    return <PageLoader label="Checking your account…" />
  }

  if (status === 'unauthenticated') {
    return <Navigate to={routes.welcome} replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}

/** Keeps signed-in members out of the welcome, login and register screens. */
export function RedirectIfAuthenticated() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'unknown') {
    return <PageLoader label="Checking your account…" />
  }

  if (status === 'authenticated') {
    return <Navigate to={returnPath(location.state)} replace />
  }

  return <Outlet />
}

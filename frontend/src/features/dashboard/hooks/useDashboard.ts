import { useCallback, useEffect, useState } from 'react'

import { dashboardService } from '@/features/dashboard/services/dashboard.service'
import type { DashboardData } from '@/features/dashboard/types'
import { toApiError, type ApiError } from '@/services/api-error'

type DashboardState =
  | { status: 'loading' }
  | { status: 'ready'; data: DashboardData }
  | { status: 'error'; error: ApiError }

export interface UseDashboardResult {
  state: DashboardState
  reload: () => void
}

/** Loads the dashboard payload and exposes loading, ready and error states. */
export function useDashboard(): UseDashboardResult {
  const [state, setState] = useState<DashboardState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    dashboardService
      .fetchDashboard()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', error: toApiError(error) })
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  // Resetting here (rather than inside the effect) keeps the transition to the
  // loading state tied to the user action that caused it.
  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }, [])

  return { state, reload }
}

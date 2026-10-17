import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * Minimum time the splash screen stays on screen.
 *
 * Without it the splash would flash for a few milliseconds on a warm cache,
 * which reads as a glitch rather than as a startup sequence.
 */
const MIN_SPLASH_DURATION = 2500

export type InitializationStatus = 'initializing' | 'ready' | 'failed'

export interface AppInitialization {
  status: InitializationStatus
  error: Error | null
  retry: () => void
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Drives the startup lifecycle:
 *
 *   1. restore the authentication session (owned by AuthProvider)
 *   2. run any other first-run work
 *   3. hold the splash for a minimum, intentional duration
 *   4. hand control back to the router
 *
 * The router decides the destination from `useAuth().status`, so this hook only
 * has to report when the app is safe to render.
 */
export function useAppInitialization(): AppInitialization {
  const { status: authStatus, restore } = useAuth()
  const [status, setStatus] = useState<InitializationStatus>('initializing')
  const [error, setError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setStatus('initializing')
      setError(null)

      try {
        const minimumSplash = delay(MIN_SPLASH_DURATION)

        // Restoring is idempotent; re-running it on retry is safe.
        await Promise.all([restore(), minimumSplash])

        if (!cancelled) setStatus('ready')
      } catch (cause) {
        if (cancelled) return
        setError(cause instanceof Error ? cause : new Error('Startup failed'))
        setStatus('failed')
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [restore, attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  // Auth settling is part of startup; if it is still unknown, we are not ready.
  const ready = status === 'ready' && authStatus !== 'unknown'

  return {
    status: status === 'failed' ? 'failed' : ready ? 'ready' : 'initializing',
    error,
    retry,
  }
}

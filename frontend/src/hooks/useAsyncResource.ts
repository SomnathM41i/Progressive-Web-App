import { useCallback, useEffect, useRef, useState } from 'react'

import { toApiError } from '@/services/api-error'

export type AsyncStatus = 'loading' | 'ready' | 'error'

export interface AsyncResource<T> {
  status: AsyncStatus
  data: T | null
  error: string | null
  /** Re-runs the loader, moving back through the loading state. */
  reload: () => void
}

/**
 * Generic loader for a single asynchronous resource.
 *
 * Keeps loading / ready / error handling out of the screens so every profile
 * section behaves the same way. The loader is re-run when `deps` change, and
 * late responses from a superseded run are ignored so a fast navigation can
 * never overwrite fresh data with stale data.
 */
export function useAsyncResource<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[],
): AsyncResource<T> {
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const latestRun = useRef(0)

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  useEffect(() => {
    const runId = ++latestRun.current
    let active = true

    setStatus('loading')
    setError(null)

    loader()
      .then((result) => {
        if (!active || runId !== latestRun.current) return
        setData(result)
        setStatus('ready')
      })
      .catch((caught: unknown) => {
        if (!active || runId !== latestRun.current) return
        setError(toApiError(caught).message)
        setStatus('error')
      })

    return () => {
      active = false
    }
    // `loader` is intentionally excluded: callers pass an inline function whose
    // identity changes every render; `deps` and `nonce` drive re-runs instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { status, data, error, reload }
}

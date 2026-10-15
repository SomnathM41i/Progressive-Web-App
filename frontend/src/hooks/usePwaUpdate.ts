import { useCallback, useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

interface PwaUpdateState {
  /** A newer service worker is waiting to take over. */
  needRefresh: boolean
  /** The app shell is cached and can now start offline. */
  offlineReady: boolean
  applyUpdate: () => Promise<void>
  dismiss: () => void
}

/**
 * Registers the service worker and exposes the update lifecycle.
 *
 * Registration is immediate so the worker installs on first paint. When a new
 * version is detected the caller decides how to surface it — we use a toast
 * rather than reloading the page out from under the user.
 */
export function usePwaUpdate(): PwaUpdateState {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const updateRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    updateRef.current = registerSW({
      immediate: true,
      onNeedRefresh: () => setNeedRefresh(true),
      onOfflineReady: () => setOfflineReady(true),
    })
  }, [])

  const applyUpdate = useCallback(async () => {
    setNeedRefresh(false)
    await updateRef.current?.(true)
  }, [])

  const dismiss = useCallback(() => setNeedRefresh(false), [])

  return { needRefresh, offlineReady, applyUpdate, dismiss }
}

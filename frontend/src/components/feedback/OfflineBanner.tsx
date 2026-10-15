import { WifiOff } from 'lucide-react'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * Slim banner shown while the device is offline.
 *
 * The app shell keeps working from the service-worker cache; anything that
 * needs live data will surface its own error state.
 */
export function OfflineBanner() {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 bg-maroon-dark px-4 py-2 text-2xs font-semibold text-gold-light"
    >
      <WifiOff className="size-3.5" aria-hidden="true" />
      You are offline — showing saved content.
    </div>
  )
}

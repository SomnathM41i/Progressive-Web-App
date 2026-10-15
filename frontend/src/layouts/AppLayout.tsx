import { useLocation, Outlet } from 'react-router-dom'

import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { AppHeader } from '@/components/navigation/AppHeader'
import { PwaUpdatePrompt } from '@/components/feedback/PwaUpdatePrompt'

/**
 * Shell for authenticated screens.
 *
 * The content column is capped at a phone width and centred, so the app keeps
 * its mobile character on tablets and desktop instead of stretching into a
 * generic dashboard layout. Each route's content re-enters with a short
 * rise/fade so navigation feels like screen changes in a native app.
 */
export function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-dvh bg-cream">
      <AppHeader />

      <main className="mx-auto min-h-[calc(100dvh-3.75rem)] w-full max-w-lg pb-24 md:max-w-2xl">
        <div key={location.pathname} className="animate-rise">
          <Outlet />
        </div>
      </main>

      <BottomNavigation />
      <PwaUpdatePrompt />
    </div>
  )
}

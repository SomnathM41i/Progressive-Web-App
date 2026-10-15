import { Outlet } from 'react-router-dom'

import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { AppHeader } from '@/components/navigation/AppHeader'
import { PwaUpdatePrompt } from '@/components/feedback/PwaUpdatePrompt'

/**
 * Shell for authenticated screens.
 *
 * The content column is capped at a phone width and centred, so the app keeps
 * its mobile character on tablets and desktop instead of stretching into a
 * generic dashboard layout.
 */
export function AppLayout() {
  return (
    <div className="min-h-dvh bg-cream">
      <AppHeader />

      <main className="mx-auto min-h-[calc(100dvh-3.75rem)] max-w-lg pb-24">
        <Outlet />
      </main>

      <BottomNavigation />
      <PwaUpdatePrompt />
    </div>
  )
}

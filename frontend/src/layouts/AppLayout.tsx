import { useLocation, Outlet } from 'react-router-dom'

import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { AppHeader } from '@/components/navigation/AppHeader'
import { PwaUpdatePrompt } from '@/components/feedback/PwaUpdatePrompt'
import { routes } from '@/config/routes'

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
  const isChatScreen = location.pathname === routes.chat
  const isProfileDetailScreen = location.pathname.startsWith('/profiles/')
  const isSearchScreen = location.pathname === routes.search
  const isMatchesScreen = location.pathname === routes.matches
  const isShortlistScreen = location.pathname === routes.shortlist
  const isOwnProfileScreen = location.pathname === routes.profile
  const isProfileEditScreen = location.pathname === routes.profileEdit
  const isInterestsScreen = location.pathname === routes.interests
  const isMembershipScreen = location.pathname === routes.membership
  const isStandaloneScreen = isChatScreen || isProfileDetailScreen || isSearchScreen
  const isFullScreenScreen = isStandaloneScreen || isMembershipScreen || isMatchesScreen || isShortlistScreen || isOwnProfileScreen || isProfileEditScreen
  const isHeaderlessScreen = isFullScreenScreen || isInterestsScreen

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {!isHeaderlessScreen ? <AppHeader /> : null}

      <main className={isFullScreenScreen ? 'mx-auto h-dvh w-full max-w-lg overflow-hidden md:max-w-2xl' : isInterestsScreen ? 'mx-auto h-[calc(100dvh-var(--app-bottom-nav-height)-env(safe-area-inset-bottom,0px))] w-full max-w-lg overflow-hidden md:h-dvh md:max-w-2xl' : 'mx-auto min-h-0 w-full max-w-lg flex-1 pb-[calc(var(--app-bottom-nav-height)+env(safe-area-inset-bottom,0px))] md:max-w-2xl md:pb-6'}>
        <div key={location.pathname} className={isFullScreenScreen || isInterestsScreen ? 'h-full min-h-0' : 'animate-rise'}>
          <Outlet />
        </div>
      </main>

      {!isFullScreenScreen ? <BottomNavigation /> : null}
      <PwaUpdatePrompt />
    </div>
  )
}

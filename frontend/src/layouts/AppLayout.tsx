import { useLocation, Outlet } from 'react-router-dom'

import { ErrorBoundary } from '@/app/ErrorBoundary'
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
  const { pathname } = location
  const isChatScreen = pathname === routes.chat
  const isProfileDetailScreen = pathname.startsWith(`${routes.profile}s/`)
  const isSearchScreen = pathname === routes.search
  const isMatchesScreen = pathname === routes.matches
  const isShortlistScreen = pathname === routes.shortlist
  const isOwnProfileScreen = pathname === routes.profile
  const isProfileEditScreen = pathname === routes.profileEdit
  // Every "/profile/..." sub-screen (basic, contact, …) is its own full-screen
  // page with a ScreenHeader, so it hides the app chrome like the overview does.
  const isProfileSubScreen = pathname.startsWith(`${routes.profile}/`) && !isProfileEditScreen
  const isInterestsScreen = pathname === routes.interests
  const isMembershipScreen = pathname === routes.membership
  const isStandaloneScreen =
    isChatScreen ||
    isProfileDetailScreen ||
    isSearchScreen ||
    isProfileSubScreen
  const isFullScreenScreen = isStandaloneScreen || isMembershipScreen || isMatchesScreen || isShortlistScreen || isOwnProfileScreen || isProfileEditScreen
  const isHeaderlessScreen = isFullScreenScreen || isInterestsScreen

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {!isHeaderlessScreen ? <AppHeader /> : null}

      <main className={isFullScreenScreen ? 'mx-auto h-dvh w-full max-w-lg overflow-hidden md:max-w-2xl' : isInterestsScreen ? 'mx-auto h-[calc(100dvh-var(--app-bottom-nav-height)-env(safe-area-inset-bottom,0px))] w-full max-w-lg overflow-hidden md:h-dvh md:max-w-2xl' : 'mx-auto min-h-0 w-full max-w-lg flex-1 pb-[calc(var(--app-bottom-nav-height)+env(safe-area-inset-bottom,0px))] md:max-w-2xl md:pb-6'}>
        <div key={location.pathname} className={isFullScreenScreen || isInterestsScreen ? 'h-full min-h-0' : 'animate-rise'}>
          <ErrorBoundary key={location.pathname} title="This screen could not be displayed">
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {!isFullScreenScreen ? <BottomNavigation /> : null}
      <PwaUpdatePrompt />
    </div>
  )
}

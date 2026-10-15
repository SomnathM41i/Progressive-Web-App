import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ScrollToTop } from '@/app/ScrollToTop'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { RedirectIfAuthenticated, RequireAuth } from '@/app/guards'
import { NotFoundPage } from '@/app/NotFoundPage'
import { routes } from '@/config/routes'

import { WelcomePage } from '@/features/auth/pages/WelcomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { SearchPage } from '@/features/search/pages/SearchPage'
import { ShortlistPage } from '@/features/shortlist/pages/ShortlistPage'
import { InterestsPage } from '@/features/interests/pages/InterestsPage'
import { ChatPage } from '@/features/chat/pages/ChatPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { ProfilePage } from '@/features/profiles/pages/ProfilePage'
import { ProfileEditPage } from '@/features/profiles/pages/ProfileEditPage'
import { ProfileDetailPage } from '@/features/profiles/pages/ProfileDetailPage'
import { BrowsePage } from '@/features/profiles/pages/BrowsePage'
import { MembershipPage } from '@/features/membership/pages/MembershipPage'
import { SuccessStoriesPage } from '@/features/success-stories/pages/SuccessStoriesPage'

/**
 * Application routing.
 *
 * The root path is the splash. After initialization the router is already
 * mounted, so the splash is replaced by a redirect based on authentication
 * state. Routes are split between the auth shell (public) and the app shell
 * (authenticated).
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route element={<RedirectIfAuthenticated />}>
            <Route path={routes.welcome} element={<WelcomePage />} />
            <Route path={routes.login} element={<LoginPage />} />
            <Route path={routes.register} element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to={routes.home} replace />} />
            <Route path={routes.home} element={<DashboardPage />} />
            <Route path={routes.search} element={<SearchPage />} />
            <Route path={routes.shortlist} element={<ShortlistPage />} />
            <Route path={routes.interests} element={<InterestsPage />} />
            <Route path={routes.chat} element={<ChatPage />} />
            <Route path={routes.notifications} element={<NotificationsPage />} />
            <Route path={routes.profile} element={<ProfilePage />} />
            <Route path={routes.profileEdit} element={<ProfileEditPage />} />
            <Route path={routes.profileDetail} element={<ProfileDetailPage />} />
            <Route path={routes.browse} element={<BrowsePage />} />
            <Route path={routes.membership} element={<MembershipPage />} />
            <Route path={routes.successStories} element={<SuccessStoriesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

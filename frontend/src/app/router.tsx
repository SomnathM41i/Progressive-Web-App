import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ScrollToTop } from '@/app/ScrollToTop'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { RedirectIfAuthenticated, RequireAuth } from '@/app/guards'
import { ProfileBiodataPage } from '@/features/profiles/pages/ProfileBiodataPage'
import { PrivacyPolicyPage } from '@/features/legal/pages/PrivacyPolicyPage'
import { TermsConditionsPage } from '@/features/legal/pages/TermsConditionsPage'
import { DisclaimerPage } from '@/features/legal/pages/DisclaimerPage'
import { NotFoundPage } from '@/app/NotFoundPage'
import { routes, legalRoutes } from '@/config/routes'

import { WelcomePage } from '@/features/auth/pages/WelcomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegistrationWizardPage } from '@/features/registration/pages/RegistrationWizardPage'
import { registrationStepPath } from '@/features/registration/steps'

import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { SearchPage } from '@/features/search/pages/SearchPage'
import { ShortlistPage } from '@/features/shortlist/pages/ShortlistPage'
import { InterestsPage } from '@/features/interests/pages/InterestsPage'
import { MatchesPage } from '@/features/matches/pages/MatchesPage'
import { ChatPage } from '@/features/chat/pages/ChatPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { ProfilePage } from '@/features/profiles/pages/ProfilePage'
import { ProfileEditPage } from '@/features/profiles/pages/ProfileEditPage'
import { ProfileBasicPage } from '@/features/profiles/pages/ProfileBasicPage'
import { ProfileContactPage } from '@/features/profiles/pages/ProfileContactPage'
import { ProfileEducationPage } from '@/features/profiles/pages/ProfileEducationPage'
import { ProfileFamilyPage } from '@/features/profiles/pages/ProfileFamilyPage'
import { ProfileHoroscopePage } from '@/features/profiles/pages/ProfileHoroscopePage'
import { ProfilePartnerPreferencePage } from '@/features/profiles/pages/ProfilePartnerPreferencePage'
import { ProfilePhotosPage } from '@/features/profiles/pages/ProfilePhotosPage'
import { ProfileDocumentsPage } from '@/features/profiles/pages/ProfileDocumentsPage'
import { ProfileSettingsPage } from '@/features/profiles/pages/ProfileSettingsPage'
import { ProfileMembershipPage } from '@/features/profiles/pages/ProfileMembershipPage'
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
          </Route>

          <Route
            path={routes.register}
            element={<Navigate to={registrationStepPath('account')} replace />}
          />
          <Route path={routes.registerStep} element={<RegistrationWizardPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to={routes.home} replace />} />
            <Route path={routes.home} element={<DashboardPage />} />
            <Route path={routes.search} element={<SearchPage />} />
            <Route path={routes.shortlist} element={<ShortlistPage />} />
            <Route path={routes.interests} element={<InterestsPage />} />
            <Route path={routes.matches} element={<MatchesPage />} />
            <Route path={routes.chat} element={<ChatPage />} />
            <Route path={routes.notifications} element={<NotificationsPage />} />
            <Route path={routes.profile} element={<ProfilePage />} />
            <Route path={routes.profileEdit} element={<ProfileEditPage />} />
            <Route path={routes.profileBasic} element={<ProfileBasicPage />} />
            <Route path={routes.profileContact} element={<ProfileContactPage />} />
            <Route path={routes.profileEducation} element={<ProfileEducationPage />} />
            <Route path={routes.profileFamily} element={<ProfileFamilyPage />} />
            <Route path={routes.profileHoroscope} element={<ProfileHoroscopePage />} />
            <Route
              path={routes.profilePartnerPreference}
              element={<ProfilePartnerPreferencePage />}
            />
            <Route path={routes.profilePhotos} element={<ProfilePhotosPage />} />
            <Route path={routes.profileDocuments} element={<ProfileDocumentsPage />} />
            <Route path={routes.profileBiodata} element={<ProfileBiodataPage />} />
            <Route path={routes.profileSettings} element={<ProfileSettingsPage />} />
            <Route
              path={routes.profileMembership}
              element={<ProfileMembershipPage />}
            />
            <Route path={routes.profileDetail} element={<ProfileDetailPage />} />
            <Route path={routes.browse} element={<BrowsePage />} />
            <Route path={routes.membership} element={<MembershipPage />} />
            <Route path={routes.successStories} element={<SuccessStoriesPage />} />
          </Route>
        </Route>

        <Route path={legalRoutes.privacyPolicy} element={<PrivacyPolicyPage />} />
        <Route path={legalRoutes.termsConditions} element={<TermsConditionsPage />} />
        <Route path={legalRoutes.disclaimer} element={<DisclaimerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

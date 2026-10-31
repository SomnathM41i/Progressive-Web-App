/**
 * Route paths in one place so links, navigation and the router cannot drift
 * apart. Values are relative to the app root.
 */
export const routes = {
  splash: '/',
  welcome: '/welcome',
  login: '/login',
  forgotPassword: '/forgot-password',
  register: '/register',
  registerStep: '/register/:step',

  home: '/home',
  search: '/search',
  shortlist: '/shortlist',
  interests: '/interests',
  matches: '/matches',
  chat: '/chat',
  notifications: '/notifications',
  profile: '/profile',
  profileEdit: '/profile/edit',
  profileBasic: '/profile/basic',
  profileContact: '/profile/contact',
  profileEducation: '/profile/education',
  profileFamily: '/profile/family',
  profileHoroscope: '/profile/horoscope',
  profilePartnerPreference: '/profile/partner-preference',
  profilePhotos: '/profile/photos',
  profileDocuments: '/profile/documents',
  profileBiodata: '/profile/biodata',
  profileSettings: '/profile/settings',
  profileMembership: '/profile/membership',
  profileDetail: '/profiles/:profileId',
  profileViews: '/profile-views',
  viewedContacts: '/viewed-contacts',

  membership: '/membership',
  browse: '/browse',
  successStories: '/success-stories',
} as const

export type RoutePath = (typeof routes)[keyof typeof routes]

/** Builds a concrete profile-detail path from a profile id. */
export function profilePath(profileId: string): string {
  return `/profiles/${encodeURIComponent(profileId)}`
}

export const legalRoutes = {
  privacyPolicy: '/privacy-policy',
  termsConditions: '/terms-and-conditions',
  disclaimer: '/disclaimer',
} as const

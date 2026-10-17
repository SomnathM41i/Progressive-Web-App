/**
 * Route paths in one place so links, navigation and the router cannot drift
 * apart. Values are relative to the app root.
 */
export const routes = {
  splash: '/',
  welcome: '/welcome',
  login: '/login',
  register: '/register',

  home: '/home',
  search: '/search',
  shortlist: '/shortlist',
  interests: '/interests',
  matches: '/matches',
  chat: '/chat',
  notifications: '/notifications',
  profile: '/profile',
  profileEdit: '/profile/edit',
  profileDetail: '/profiles/:profileId',

  membership: '/membership',
  browse: '/browse',
  successStories: '/success-stories',
} as const

export type RoutePath = (typeof routes)[keyof typeof routes]

/** Builds a concrete profile-detail path from a profile id. */
export function profilePath(profileId: string): string {
  return `/profiles/${encodeURIComponent(profileId)}`
}

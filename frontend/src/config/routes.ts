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
  notifications: '/notifications',
  profile: '/profile',
  profileEdit: '/profile/edit',

  membership: '/membership',
  browse: '/browse',
  successStories: '/success-stories',
} as const

export type RoutePath = (typeof routes)[keyof typeof routes]

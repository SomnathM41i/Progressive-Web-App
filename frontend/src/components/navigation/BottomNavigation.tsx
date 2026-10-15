import { Bell, Bookmark, Home, Search, UserRound, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { routes } from '@/config/routes'
import { cn } from '@/lib/cn'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

const bottomNavItems: NavItem[] = [
  { label: 'Home', to: routes.home, icon: Home },
  { label: 'Search', to: routes.search, icon: Search },
  { label: 'Shortlist', to: routes.shortlist, icon: Bookmark },
  { label: 'Notifications', to: routes.notifications, icon: Bell },
  { label: 'Profile', to: routes.profile, icon: UserRound },
]

/**
 * Persistent mobile tab bar.
 *
 * Sits above the device safe area and uses `end` matching on the home route so
 * it is not highlighted on every nested path.
 */
export function BottomNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md pb-safe"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {bottomNavItems.map(({ label, to, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === routes.home}
              className={({ isActive }) =>
                cn(
                  'relative flex h-16 flex-col items-center justify-center gap-1 transition-colors',
                  isActive ? 'text-saffron' : 'text-muted hover:text-maroon',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute top-0 h-0.5 w-8 rounded-full transition-opacity',
                      isActive ? 'bg-saffron opacity-100' : 'opacity-0',
                    )}
                  />
                  <Icon
                    className={cn('size-5 transition-transform', isActive && 'scale-110')}
                    aria-hidden="true"
                  />
                  <span className="text-2xs font-semibold">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

import {
  Heart,
  Home,
  MessageCircle,
  Search,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
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
  { label: 'Interests', to: routes.interests, icon: Heart },
  { label: 'Chat', to: routes.chat, icon: MessageCircle },
  { label: 'Profile', to: routes.profile, icon: UserRound },
]

/**
 * Persistent mobile tab bar.
 *
 * Hidden from the `md` breakpoint, where the header carries navigation instead.
 * `end` matching on the home route keeps it from highlighting on nested paths.
 */
export function BottomNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-safe shadow-nav backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {bottomNavItems.map(({ label, to, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === routes.home}
              className={({ isActive }) =>
                cn(
                  'relative flex h-16 flex-col items-center justify-center gap-1 transition active:opacity-60',
                  isActive ? 'text-maroon' : 'text-muted hover:text-maroon',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full transition',
                      isActive ? 'bg-rose' : 'bg-transparent',
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
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

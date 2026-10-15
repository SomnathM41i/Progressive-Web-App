import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import logo from '@/assets/images/shivraj-logo.png'
import { Avatar } from '@/components/ui/Avatar'
import { IconLink } from '@/components/ui/IconButton'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cn } from '@/lib/cn'

const desktopNavItems = [
  { label: 'Home', to: routes.home, end: true },
  { label: 'Search', to: routes.search, end: false },
  { label: 'Shortlist', to: routes.shortlist, end: false },
  { label: 'Messages', to: routes.chat, end: false },
]

/**
 * Top bar for the authenticated app.
 *
 * Shows the brand, a notifications shortcut and the member's avatar. From the
 * `md` breakpoint it also carries inline navigation, since the bottom tab bar
 * is hidden there. It picks up a soft shadow once the page scrolls, the way an
 * app bar separates from content underneath it.
 */
export function AppHeader() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-line bg-cream/92 pt-safe backdrop-blur-md transition-shadow duration-200',
        scrolled ? 'shadow-bar' : 'shadow-none',
      )}
    >
      <div className="mx-auto flex h-15 max-w-lg items-center justify-between gap-3 px-4 md:max-w-2xl">
        <div className="flex min-w-0 items-center gap-1.5">
          <Link
            to={routes.home}
            className="flex min-w-0 items-center gap-2.5 transition-transform active:scale-95"
          >
            <img
              src={logo}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 object-contain"
            />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-bold text-maroon">
                शिवराज मराठा
              </span>
              <span className="truncate text-2xs text-muted">वधू वर सूचक केंद्र</span>
            </span>
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {desktopNavItems.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  isActive
                    ? 'bg-rose text-maroon'
                    : 'text-muted hover:bg-cream-dark hover:text-ink',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <IconLink label="Notifications" to={routes.notifications} size="sm">
            <Bell className="size-4.5" aria-hidden="true" />
          </IconLink>

          <Link
            to={routes.profile}
            aria-label="Profile"
            className="rounded-full transition active:scale-95"
          >
            <Avatar src={user?.avatarUrl} name={user?.name ?? 'Member'} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  )
}

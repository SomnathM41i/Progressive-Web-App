import { Bell, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import logo from '@/assets/images/shivraj-logo.png'
import { IconLink } from '@/components/ui/IconButton'
import { routes, legalRoutes } from '@/config/routes'
import { cn } from '@/lib/cn'

const desktopNavItems = [
  { label: 'Home', to: routes.home, end: true },
  { label: 'Search', to: routes.search, end: false },
  { label: 'Shortlist', to: routes.shortlist, end: false },
  { label: 'Messages', to: routes.chat, end: false },
]

export function AppHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-line bg-cream/95 pt-safe backdrop-blur-md transition-shadow duration-200',
        scrolled ? 'shadow-bar' : 'shadow-none',
      )}
    >
      <div className="relative mx-auto flex h-[var(--app-main-header-height)] max-w-lg items-center justify-between gap-2 px-3 md:max-w-2xl md:px-4">
        <button
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex size-9 items-center justify-center rounded-full text-maroon md:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Link
          to={routes.home}
          className="absolute left-1/2 flex min-w-0 -translate-x-1/2 items-center gap-2 transition-transform active:scale-95 md:static md:translate-x-0"
        >
          <img
            src={logo}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 object-contain"
          />
          <span className="flex min-w-0 flex-col text-center leading-tight md:text-left">
            <span className="truncate text-sm font-bold text-maroon">शिवराज मराठा</span>
            <span className="truncate text-2xs text-muted">वधू वर सूचक केंद्र</span>
          </span>
        </Link>
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
        </div>
        {menuOpen ? (
          <nav
            aria-label="Mobile menu"
            className="absolute top-full left-2 z-50 mt-2 flex w-60 flex-col rounded-2xl border border-line bg-white p-2 shadow-lift md:hidden"
          >
            {[
              ...desktopNavItems,
              { label: 'Interests', to: routes.interests, end: false },
              { label: 'Membership plans', to: routes.membership, end: false },
              { label: 'Privacy Policy', to: legalRoutes.privacyPolicy, end: false },
              { label: 'Terms and Conditions', to: legalRoutes.termsConditions, end: false },
              { label: 'Disclaimer', to: legalRoutes.disclaimer, end: false },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-rose"
              >
                {label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  )
}

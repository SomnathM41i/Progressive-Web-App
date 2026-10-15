import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { IconLink } from '@/components/ui/IconButton'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import logo from '@/assets/images/shivraj-logo.png'

/**
 * Compact top bar for the authenticated app.
 *
 * Shows the brand mark, a notifications shortcut and the member's avatar. The
 * personalised greeting lives in the page content so the header stays the same
 * across every authenticated screen.
 */
export function AppHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/92 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-15 max-w-lg items-center justify-between gap-3 px-4">
        <Link to={routes.home} className="flex min-w-0 items-center gap-2.5">
          <img
            src={logo}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 object-contain"
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-bold text-maroon">शिवराज मराठा</span>
            <span className="truncate text-2xs text-muted">वधू वर सूचक केंद्र</span>
          </span>
        </Link>

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

import {
  Bell,
  Bookmark,
  Compass,
  Crown,
  Search,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { routes } from '@/config/routes'

interface QuickAction {
  label: string
  to: string
  icon: LucideIcon
}

const actions: QuickAction[] = [
  { label: 'Search', to: routes.search, icon: Search },
  { label: 'Browse', to: routes.browse, icon: Compass },
  { label: 'Shortlist', to: routes.shortlist, icon: Bookmark },
  { label: 'My profile', to: routes.profile, icon: UserRound },
  { label: 'Notifications', to: routes.notifications, icon: Bell },
  { label: 'Membership', to: routes.membership, icon: Crown },
]

/** Six shortcuts to the core matrimonial flows. */
export function QuickActions() {
  return (
    <nav aria-label="Quick actions">
      <ul className="grid grid-cols-3 gap-2.5">
        {actions.map(({ label, to, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex h-full flex-col items-center gap-2 rounded-lg border border-line bg-surface px-2 py-3.5 text-center shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card active:scale-[0.98]"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-maroon/8 to-gold/12 text-maroon">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="text-2xs leading-tight font-semibold text-ink">
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

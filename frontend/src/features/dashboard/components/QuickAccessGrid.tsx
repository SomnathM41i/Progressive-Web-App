import { Link } from 'react-router-dom'

import { shortcutTiles } from '@/features/dashboard/config/banners'

/** Four shortcut tiles into the core matrimonial flows. */
export function QuickAccessGrid() {
  return (
    <nav aria-label="Quick access">
      <ul className="grid grid-cols-4 gap-2.5">
        {shortcutTiles.map(({ label, to, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-card border border-line bg-surface p-2 text-center shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-maroon/25 hover:shadow-card active:scale-[0.98]"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-rose text-maroon">
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

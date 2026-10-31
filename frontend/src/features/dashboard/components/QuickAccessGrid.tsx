import { Link } from 'react-router-dom'

import { shortcutTiles } from '@/features/dashboard/config/banners'

/**
 * Shortcut tiles into the core matrimonial flows. Tiles that do not fit scroll
 * horizontally on phones; the partly visible last tile hints at the scroll.
 */
export function QuickAccessGrid() {
  return (
    <nav aria-label="Quick access">
      <ul className="-mx-4 flex [scrollbar-width:none] gap-2.5 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
        {shortcutTiles.map(({ label, to, icon: Icon }) => (
          <li key={to} className="w-[22%] min-w-[4.75rem] shrink-0 md:w-auto md:flex-1">
            <Link
              to={to}
              className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-card border border-line bg-surface p-2 text-center shadow-soft transition duration-200 hover:border-maroon/25 hover:shadow-card active:scale-[0.98]"
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

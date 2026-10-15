import { Home, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { routes } from '@/config/routes'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-maroon/6 text-maroon">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-2xl text-maroon">Page not found</h1>
      <p className="max-w-xs text-sm text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to={routes.home}
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-saffron to-saffron-dark px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(232,97,42,0.32)]"
      >
        <Home className="size-4" aria-hidden="true" />
        Go home
      </Link>
    </div>
  )
}

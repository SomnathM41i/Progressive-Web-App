import { Home, TriangleAlert } from 'lucide-react'

import { ButtonLink } from '@/components/ui/Button'
import { routes } from '@/config/routes'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-rose text-maroon">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-2xl text-maroon">Page not found</h1>
      <p className="max-w-xs text-sm text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <ButtonLink
        to={routes.home}
        className="mt-2"
        leadingIcon={<Home className="size-4" aria-hidden="true" />}
      >
        Go home
      </ButtonLink>
    </div>
  )
}

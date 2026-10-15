import { ChevronLeft, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { routes } from '@/config/routes'

/**
 * Registration entry point.
 *
 * The real enrolment form is a multi-step flow that depends on the API
 * collection, so only the shell and the redirect to the website are in place.
 */
export function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col px-6 pt-safe pb-safe">
      <header className="flex h-14 items-center">
        <Link
          to={routes.welcome}
          aria-label="Back"
          className="-ml-2 flex size-9 items-center justify-center rounded-full text-maroon transition hover:bg-rose"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Link>
      </header>

      <div className="flex flex-1 flex-col justify-center py-6">
        <h1 className="text-2xl text-maroon">Register</h1>
        <p className="mt-1.5 text-sm text-muted">
          Fill in your basic details and create your profile.
        </p>

        <Card className="mt-6 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose text-maroon">
            <UserPlus className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">
              Registration form coming soon
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              The registration form is not part of this version. Multi-step registration
              will run here once the API collection is connected.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

import { RefreshCw, ServerCrash } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface StartupErrorProps {
  message?: string
  onRetry: () => void
}

/** Shown when the startup sequence itself fails, rather than a single screen. */
export function StartupError({ message, onRetry }: StartupErrorProps) {
  return (
    <div
      role="alert"
      className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-cream px-8 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <ServerCrash className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-xl text-maroon">Could not start the app</h1>
      <p className="max-w-xs text-sm text-muted">
        {message ?? 'Something went wrong during startup. Please try again.'}
      </p>
      <Button
        className="mt-2"
        onClick={onRetry}
        leadingIcon={<RefreshCw className="size-4" aria-hidden="true" />}
      >
        Try again
      </Button>
    </div>
  )
}

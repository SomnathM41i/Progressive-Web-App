import { AlertTriangle, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this section. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-card border border-danger/20 bg-danger-soft/60 px-6 py-8 text-center"
    >
      <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">{description}</p>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
          leadingIcon={<RotateCw className="size-4" aria-hidden="true" />}
        >
          Try again
        </Button>
      ) : null}
    </div>
  )
}

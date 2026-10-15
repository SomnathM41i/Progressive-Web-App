import { Spinner } from '@/components/loading/Spinner'

interface PageLoaderProps {
  label?: string
}

/** Full-height loader for route-level suspense and initial data fetches. */
export function PageLoader({ label = 'Loading…' }: PageLoaderProps) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 text-maroon">
      <Spinner className="size-7" label={label} />
      <p className="text-xs font-medium text-muted">{label}</p>
    </div>
  )
}

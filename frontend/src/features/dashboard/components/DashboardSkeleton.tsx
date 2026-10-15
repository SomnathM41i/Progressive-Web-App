import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Loading placeholder for the dashboard.
 *
 * Mirrors the real layout — hero, profile summary, quick-access grid and the
 * profile rails — so data arriving swaps in place instead of the whole screen
 * jumping.
 */
export function DashboardSkeleton() {
  return (
    <div role="status" className="space-y-6 px-4 pt-4 pb-6">
      <span className="sr-only">Loading dashboard</span>

      <Skeleton className="h-56 w-full rounded-card" />

      <Skeleton className="h-40 w-full rounded-card" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-28 rounded-full" />
        <div className="grid grid-cols-4 gap-2.5">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-card" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-44 rounded-full" />
        <div className="-mx-4 flex gap-3 px-4">
          <Skeleton className="h-52 w-40 shrink-0 rounded-card" />
          <Skeleton className="h-52 w-40 shrink-0 rounded-card" />
          <Skeleton className="h-52 w-40 shrink-0 rounded-card" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-32 rounded-full" />
        <div className="-mx-4 flex gap-3 px-4">
          <Skeleton className="h-52 w-40 shrink-0 rounded-card" />
          <Skeleton className="h-52 w-40 shrink-0 rounded-card" />
        </div>
      </div>

      <Skeleton className="h-28 w-full rounded-card" />
      <Skeleton className="h-44 w-full rounded-card" />
    </div>
  )
}

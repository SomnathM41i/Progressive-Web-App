import type { ReactNode } from 'react'

import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import type { AsyncStatus } from '@/hooks/useAsyncResource'

interface SectionStateProps {
  title: string
  status: AsyncStatus
  error: string | null
  reload: () => void
  /** Fields/rows count to shape the loading skeleton. */
  skeletonRows?: number
  children: ReactNode
}

/**
 * Shell shared by every profile detail screen.
 *
 * Owns the app-bar frame and the loading / error states so each screen only has
 * to describe its success content.
 */
export function SectionState({
  title,
  status,
  error,
  reload,
  skeletonRows = 6,
  children,
}: SectionStateProps) {
  return (
    <AppScreen>
      <ScreenHeader title={title} />
      <main className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4">
        {status === 'loading' ? <SectionSkeleton rows={skeletonRows} /> : null}
        {status === 'error' ? (
          <ErrorState description={error ?? undefined} onRetry={reload} />
        ) : null}
        {status === 'ready' ? children : null}
      </main>
    </AppScreen>
  )
}

function SectionSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40 rounded-full" />
      <div className="rounded-card border border-line bg-surface p-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4 py-2.5">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-3 w-32 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

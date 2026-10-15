import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/** Shown when a section is available but currently has nothing to display. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-card border border-dashed border-line-strong',
        'bg-surface/60 px-6 py-8 text-center',
        className,
      )}
    >
      <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-maroon/6 text-maroon">
        {icon}
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

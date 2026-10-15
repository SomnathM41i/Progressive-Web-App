import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="truncate text-lg text-maroon">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

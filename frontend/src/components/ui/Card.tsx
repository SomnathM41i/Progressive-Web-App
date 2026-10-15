import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Removes the default padding when the card owns its own inner layout. */
  flush?: boolean
}

export function Card({ flush = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface shadow-soft',
        !flush && 'p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

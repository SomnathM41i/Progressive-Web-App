import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface AppScreenProps extends HTMLAttributes<HTMLDivElement> {
  safeBottom?: boolean
}

/** Full-height, safe-area-aware screen frame for standalone app routes. */
export function AppScreen({ safeBottom = true, className, children, ...rest }: AppScreenProps) {
  return (
    <div
      className={cn('mx-auto flex h-full min-h-0 w-full max-w-lg flex-col bg-[var(--color-app-canvas)] pt-safe md:max-w-2xl', safeBottom && 'pb-safe', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

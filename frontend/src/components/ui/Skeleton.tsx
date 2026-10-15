import { cn } from '@/lib/cn'

interface SkeletonProps {
  className?: string
}

/**
 * Shimmering placeholder block used while real content loads.
 *
 * Skeletons mirror the shape of the layout that is about to appear, so the
 * page never flashes an empty screen or a lone spinner. Always hidden from
 * assistive technology — the surrounding loading region owns the announcement.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block bg-gradient-to-r from-maroon/8 via-maroon/14 to-maroon/8 ' +
          'animate-shimmer bg-[length:200%_100%]',
        className,
      )}
    />
  )
}

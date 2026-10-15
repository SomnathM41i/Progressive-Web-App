import { cn } from '@/lib/cn'

interface ProgressBarProps {
  value: number
  label?: string
  tone?: 'brand' | 'success' | 'onDark'
  className?: string
}

const tones = {
  brand: 'bg-maroon',
  success: 'bg-success',
  onDark: 'bg-white',
} as const

export function ProgressBar({
  value,
  label,
  tone = 'brand',
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-rose', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500',
          tones[tone],
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

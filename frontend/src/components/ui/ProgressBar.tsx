import { cn } from '@/lib/cn'

interface ProgressBarProps {
  value: number
  label?: string
  tone?: 'saffron' | 'gold' | 'success'
  className?: string
}

const tones = {
  saffron: 'bg-gradient-to-r from-saffron to-gold',
  gold: 'bg-gradient-to-r from-gold to-gold-light',
  success: 'bg-success',
} as const

export function ProgressBar({
  value,
  label,
  tone = 'saffron',
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
      className={cn('h-2 w-full overflow-hidden rounded-full bg-maroon/10', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', tones[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

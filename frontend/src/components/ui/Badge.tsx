import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

const tones: Record<Tone, string> = {
  neutral: 'bg-cream-dark text-muted',
  brand: 'bg-rose text-maroon',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}

interface BadgeProps {
  tone?: Tone
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-semibold tracking-wide',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

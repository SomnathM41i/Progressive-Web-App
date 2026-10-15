import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

import type { ToastRecord, ToastVariant } from '@/components/feedback/toast-context'
import { cn } from '@/lib/cn'

interface VariantStyle {
  icon: LucideIcon
  accent: string
  iconWrap: string
  spins?: boolean
}

const variantStyles: Record<ToastVariant, VariantStyle> = {
  success: {
    icon: CheckCircle2,
    accent: 'border-l-success',
    iconWrap: 'bg-success-soft text-success',
  },
  error: {
    icon: XCircle,
    accent: 'border-l-danger',
    iconWrap: 'bg-danger-soft text-danger',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'border-l-warning',
    iconWrap: 'bg-warning-soft text-warning',
  },
  info: {
    icon: Info,
    accent: 'border-l-info',
    iconWrap: 'bg-info-soft text-info',
  },
  loading: {
    icon: Loader2,
    accent: 'border-l-maroon',
    iconWrap: 'bg-maroon/8 text-maroon',
    spins: true,
  },
}

interface ToastItemProps {
  toast: ToastRecord
  onDismiss: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
}

export function ToastItem({ toast, onDismiss, onPause, onResume }: ToastItemProps) {
  const style = variantStyles[toast.variant]
  const Icon = style.icon
  const isAssertive = toast.variant === 'error' || toast.variant === 'warning'

  return (
    <div
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      onMouseEnter={() => onPause(toast.id)}
      onMouseLeave={() => onResume(toast.id)}
      onFocus={() => onPause(toast.id)}
      onBlur={() => onResume(toast.id)}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-md border border-line',
        'border-l-4 bg-surface p-3.5 shadow-card',
        style.accent,
        toast.leaving ? 'animate-toast-out' : 'animate-toast-in',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
          style.iconWrap,
        )}
      >
        <Icon
          className={cn('size-4.5', style.spins && 'animate-spin-slow')}
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm leading-snug font-semibold text-ink">{toast.message}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {toast.description}
          </p>
        ) : null}
        {toast.action ? (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-semibold text-saffron hover:text-saffron-dark"
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="-mt-0.5 -mr-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-maroon/6 hover:text-maroon"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

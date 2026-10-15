import { ToastItem } from '@/components/feedback/ToastItem'
import type { ToastRecord } from '@/components/feedback/toast-context'

interface ToastViewportProps {
  toasts: ToastRecord[]
  onDismiss: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
}

/**
 * Fixed stack of active notifications.
 *
 * Anchored to the top so it never collides with the bottom navigation bar, and
 * offset by the device safe area on notched screens.
 */
export function ToastViewport({
  toasts,
  onDismiss,
  onPause,
  onResume,
}: ToastViewportProps) {
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-3 pt-safe">
      <div className="flex w-full max-w-md flex-col gap-2 pt-3">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            onPause={onPause}
            onResume={onResume}
          />
        ))}
      </div>
    </div>
  )
}

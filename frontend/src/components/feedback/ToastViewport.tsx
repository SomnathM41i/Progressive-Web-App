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
 * Anchored to the bottom, lifted clear of the mobile tab bar (4rem) and the
 * device safe area, so it never covers the header or the bottom navigation.
 */
export function ToastViewport({
  toasts,
  onDismiss,
  onPause,
  onResume,
}: ToastViewportProps) {
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]">
      <div className="flex w-full max-w-md flex-col-reverse gap-2">
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

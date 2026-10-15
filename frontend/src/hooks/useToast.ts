import { useContext } from 'react'

import { ToastContext, type ToastApi } from '@/components/feedback/toast-context'

/**
 * Access the notification queue.
 *
 * ```tsx
 * const toast = useToast()
 * toast.success('Profile updated successfully')
 * ```
 */
export function useToast(): ToastApi {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>.')
  }

  return context.api
}

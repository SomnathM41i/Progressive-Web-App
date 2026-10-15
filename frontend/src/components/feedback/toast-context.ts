import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  /** Secondary line rendered under the message. */
  description?: string
  /** Milliseconds before auto-dismiss. `0` keeps the toast until dismissed. */
  duration?: number
  /** Replaces the generated id, which also makes duplicate ids collapse. */
  id?: string
  action?: ToastAction
}

export interface ToastRecord extends ToastOptions {
  id: string
  variant: ToastVariant
  message: string
  /** True while the exit animation plays, just before removal. */
  leaving: boolean
}

export interface ToastApi {
  show: (variant: ToastVariant, message: string, options?: ToastOptions) => string
  success: (message: string, options?: ToastOptions) => string
  error: (message: string, options?: ToastOptions) => string
  warning: (message: string, options?: ToastOptions) => string
  info: (message: string, options?: ToastOptions) => string
  loading: (message: string, options?: ToastOptions) => string
  /** Mutates an existing toast — typically `loading` into `success`. */
  update: (id: string, patch: Partial<Omit<ToastRecord, 'id'>>) => void
  dismiss: (id: string) => void
  clear: () => void
}

export interface ToastContextValue {
  toasts: ToastRecord[]
  api: ToastApi
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
  loading: 0,
}

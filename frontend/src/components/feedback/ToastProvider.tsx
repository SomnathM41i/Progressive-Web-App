import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import {
  DEFAULT_DURATIONS,
  ToastContext,
  type ToastApi,
  type ToastContextValue,
  type ToastOptions,
  type ToastRecord,
  type ToastVariant,
} from '@/components/feedback/toast-context'
import { ToastViewport } from '@/components/feedback/ToastViewport'

/** Must stay in sync with `--animate-toast-out` in tokens.css. */
const EXIT_DURATION = 180
const MAX_VISIBLE = 4

interface TimerEntry {
  handle: ReturnType<typeof setTimeout>
  remaining: number
  startedAt: number
}

let toastCounter = 0
const nextId = () => `toast-${++toastCounter}`

/**
 * Owns the notification queue.
 *
 * Deliberately small: a list of records, a timer per record and a handful of
 * methods. Anything more elaborate would not earn its keep.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const timers = useRef(new Map<string, TimerEntry>())

  const clearTimer = useCallback((id: string) => {
    const entry = timers.current.get(id)
    if (entry) {
      clearTimeout(entry.handle)
      timers.current.delete(id)
    }
  }, [])

  const remove = useCallback(
    (id: string) => {
      clearTimer(id)
      setToasts((current) => current.filter((toast) => toast.id !== id))
    },
    [clearTimer],
  )

  /** Plays the exit animation, then removes the toast. */
  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id)
      setToasts((current) =>
        current.map((toast) =>
          toast.id === id ? { ...toast, leaving: true } : toast,
        ),
      )
      setTimeout(() => remove(id), EXIT_DURATION)
    },
    [clearTimer, remove],
  )

  const schedule = useCallback(
    (id: string, duration: number) => {
      if (duration <= 0) return
      clearTimer(id)
      timers.current.set(id, {
        handle: setTimeout(() => dismiss(id), duration),
        remaining: duration,
        startedAt: Date.now(),
      })
    },
    [clearTimer, dismiss],
  )

  const show = useCallback(
    (variant: ToastVariant, message: string, options: ToastOptions = {}) => {
      const id = options.id ?? nextId()
      const duration = options.duration ?? DEFAULT_DURATIONS[variant]

      setToasts((current) => {
        const existing = current.find((toast) => toast.id === id)

        // Same toast still on screen: refresh it instead of stacking a duplicate.
        if (existing) {
          return current.map((toast) =>
            toast.id === id
              ? { ...toast, ...options, variant, message, leaving: false }
              : toast,
          )
        }

        const next: ToastRecord = {
          ...options,
          id,
          variant,
          message,
          leaving: false,
        }

        return [...current, next].slice(-MAX_VISIBLE)
      })

      schedule(id, duration)
      return id
    },
    [schedule],
  )

  const update = useCallback(
    (id: string, patch: Partial<Omit<ToastRecord, 'id'>>) => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, ...patch } : toast)),
      )

      if (patch.duration !== undefined) {
        schedule(id, patch.duration)
      } else if (patch.variant && patch.variant !== 'loading') {
        schedule(id, DEFAULT_DURATIONS[patch.variant])
      }
    },
    [schedule],
  )

  const clear = useCallback(() => {
    timers.current.forEach((entry) => clearTimeout(entry.handle))
    timers.current.clear()
    setToasts([])
  }, [])

  /** Pauses the countdown while the pointer rests on a toast. */
  const pause = useCallback((id: string) => {
    const entry = timers.current.get(id)
    if (!entry) return
    clearTimeout(entry.handle)
    entry.remaining = Math.max(0, entry.remaining - (Date.now() - entry.startedAt))
  }, [])

  const resume = useCallback(
    (id: string) => {
      const entry = timers.current.get(id)
      if (!entry || entry.remaining <= 0) return
      entry.startedAt = Date.now()
      entry.handle = setTimeout(() => dismiss(id), entry.remaining)
    },
    [dismiss],
  )

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((entry) => clearTimeout(entry.handle))
      pending.clear()
    }
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message, options) => show('success', message, options),
      error: (message, options) => show('error', message, options),
      warning: (message, options) => show('warning', message, options),
      info: (message, options) => show('info', message, options),
      loading: (message, options) => show('loading', message, options),
      update,
      dismiss,
      clear,
    }),
    [show, update, dismiss, clear],
  )

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, api }),
    [toasts, api],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} onPause={pause} onResume={resume} />
    </ToastContext.Provider>
  )
}

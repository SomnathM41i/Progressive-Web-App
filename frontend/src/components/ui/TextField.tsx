import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  leadingIcon?: ReactNode
}

export function TextField({
  label,
  hint,
  error,
  leadingIcon,
  className,
  id,
  ...rest
}: TextFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className="text-xs font-semibold text-maroon">
        {label}
      </label>

      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-surface px-3 transition',
          'focus-within:ring-2 focus-within:ring-maroon/15',
          error
            ? 'border-danger/50 focus-within:border-danger'
            : 'border-line-strong focus-within:border-maroon',
        )}
      >
        {leadingIcon ? (
          <span className="text-muted" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}

        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/60"
          {...rest}
        />
      </div>

      {error ? (
        <p id={`${fieldId}-error`} role="alert" className="text-2xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-2xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

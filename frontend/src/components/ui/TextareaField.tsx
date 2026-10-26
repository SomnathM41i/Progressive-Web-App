import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextareaField({
  label,
  error,
  className,
  id,
  ...rest
}: TextareaFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className="text-xs font-semibold text-maroon">
        {label}
      </label>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          'min-h-24 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink transition outline-none',
          'focus:border-maroon focus:ring-2 focus:ring-maroon/15',
          error ? 'border-danger/50' : 'border-line-strong',
        )}
        {...rest}
      />
      {error ? (
        <p id={`${fieldId}-error`} role="alert" className="text-2xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

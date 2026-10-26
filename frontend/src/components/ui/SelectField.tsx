import { useId } from 'react'
import type { ReactNode, SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
  options: readonly SelectOption[]
  placeholder?: string
  leadingIcon?: ReactNode
}

export function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  leadingIcon,
  className,
  id,
  ...rest
}: SelectFieldProps) {
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

        <select
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-[var(--control-height)] w-full appearance-none bg-transparent text-sm text-ink outline-none disabled:text-muted"
          {...rest}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none text-muted" aria-hidden="true">
          ▾
        </span>
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

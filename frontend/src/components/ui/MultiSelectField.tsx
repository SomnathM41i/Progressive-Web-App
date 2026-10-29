import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectFieldProps {
  label: string
  hint?: string
  error?: string
  options: readonly MultiSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

function parseValue(value: string, options: readonly MultiSelectOption[]): string[] {
  const trimmed = value.trim()
  if (!trimmed) return []
  const known = [...options]
    .map((option) => option.value)
    .sort((left, right) => right.length - left.length)
  const parts: string[] = []
  let rest = trimmed

  while (rest) {
    const match = known.find(
      (option) => rest === option || rest.startsWith(`${option},`),
    )
    if (match) {
      parts.push(match)
      rest = rest.slice(match.length).replace(/^,\s*/, '')
      continue
    }
    const comma = rest.indexOf(',')
    if (comma === -1) {
      parts.push(rest.trim())
      break
    }
    parts.push(rest.slice(0, comma).trim())
    rest = rest.slice(comma + 1).trim()
  }

  return parts.filter(Boolean)
}

export function MultiSelectField({
  label,
  hint,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select options',
  disabled = false,
}: MultiSelectFieldProps) {
  const generatedId = useId()
  const fieldId = `multiselect-${generatedId}`
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => parseValue(value, options), [value, options])
  const selectedSet = useMemo(() => new Set(selected), [selected])
  const allOptions = useMemo(() => {
    const known = new Set(options.map((option) => option.value))
    const extras = selected
      .filter((item) => !known.has(item))
      .map((item) => ({ value: item, label: item }))
    return [...extras, ...options]
  }, [options, selected])
  const selectedLabels = allOptions
    .filter((option) => selectedSet.has(option.value))
    .map((option) => option.label)
  const selectedSummary =
    selectedLabels.length <= 2
      ? selectedLabels.join(', ')
      : `${selectedLabels.slice(0, 2).join(', ')} +${selectedLabels.length - 2}`

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggle(optionValue: string) {
    const next = new Set(selectedSet)
    if (next.has(optionValue)) next.delete(optionValue)
    else next.add(optionValue)
    onChange([...next].join(','))
  }

  return (
    <div ref={containerRef} className={cn('relative flex min-w-0 flex-col gap-1.5')}>
      <label id={`${fieldId}-label`} className="text-xs font-semibold text-maroon">
        {label}
      </label>

      <button
        type="button"
        id={fieldId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${fieldId}-label`}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex min-h-[var(--control-height)] min-w-0 w-full items-center gap-2 rounded-lg border bg-surface px-3 py-2 text-left shadow-soft transition-colors hover:border-maroon/30',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/15',
          error
            ? 'border-danger/50 focus-visible:border-danger'
            : 'border-line-strong focus-visible:border-maroon',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-sm',
            selectedLabels.length ? 'text-ink' : 'text-muted/60',
          )}
        >
          {selectedLabels.length ? selectedSummary : placeholder}
        </span>
        <span className="pointer-events-none text-muted" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={`${fieldId}-label`}
          className="absolute top-full right-0 left-0 z-20 mt-1 max-h-64 overflow-auto rounded-lg border border-line-strong bg-surface p-1.5 shadow-lg"
        >
          {allOptions.length ? (
            allOptions.map((option) => {
              const checked = selectedSet.has(option.value)
              return (
                <label
                  key={option.value}
                  role="option"
                  aria-selected={checked}
                  className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-cream"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(option.value)}
                    className="size-4 rounded border-line-strong"
                  />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </label>
              )
            })
          ) : (
            <p className="px-2 py-2 text-sm text-muted">No options available</p>
          )}
        </div>
      ) : null}

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

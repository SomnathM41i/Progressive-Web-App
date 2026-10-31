import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, Search, X, type LucideIcon } from 'lucide-react'

import type { MasterOption } from '@/features/registration/services/master-data.service'

interface MultiFilterRowProps {
  label: string
  icon: LucideIcon
  values: string[]
  anyLabel: string
  options: MasterOption[]
  disabled?: boolean
  onChange: (values: string[]) => void
}

/**
 * A filter row that opens a searchable checkbox sheet. Master lists run to 90
 * entries, which a small dropdown handles badly on a phone. Selections apply as
 * they are ticked; nothing selected means "Any".
 */
export function MultiFilterRow({
  label,
  icon: Icon,
  values,
  anyLabel,
  options,
  disabled = false,
  onChange,
}: MultiFilterRowProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const visible = useMemo(() => {
    const wanted = query.trim().toLowerCase()
    return wanted
      ? options.filter((option) => option.label.toLowerCase().includes(wanted))
      : options
  }, [options, query])

  const firstLabel =
    options.find((option) => option.value === values[0])?.label ?? values[0]
  const summary = values.length
    ? values.length === 1
      ? firstLabel
      : `${firstLabel} +${values.length - 1}`
    : anyLabel

  function toggle(value: string) {
    onChange(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    )
  }

  function close() {
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <div className="grid min-h-[3.35rem] grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] items-center gap-3">
        <span className="flex min-w-0 items-center gap-3 text-[13px] text-ink">
          <Icon className="size-[18px] shrink-0 text-[#5f5b5c]" strokeWidth={1.7} />
          <span className="truncate">{label}</span>
        </span>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-label={`${label}: ${summary}`}
          onClick={() => setOpen(true)}
          className="relative h-10 w-full rounded-xl border border-[#eee9e7] bg-white pr-8 pl-3 text-left text-[13px] text-ink outline-none focus:border-maroon/50 disabled:opacity-55"
        >
          <span className="block truncate">{summary}</span>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[80dvh] w-full max-w-lg flex-col rounded-t-2xl bg-white pb-safe md:max-w-2xl"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-4 pb-2">
              <h2 className="truncate text-base font-semibold text-ink">{label}</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink hover:bg-rose"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>

            {options.length > 8 ? (
              <div className="shrink-0 px-4 pb-2">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-[#eee9e7] px-3">
                  <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search"
                    aria-label={`Search ${label.toLowerCase()}`}
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none"
                  />
                </div>
              </div>
            ) : null}

            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2">
              {visible.map((option) => {
                const checked = values.includes(option.value)
                return (
                  <li key={option.value}>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-ink hover:bg-cream">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(option.value)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`flex size-5 shrink-0 items-center justify-center rounded border peer-focus-visible:ring-2 peer-focus-visible:ring-maroon/30 ${checked ? 'border-maroon bg-maroon text-white' : 'border-line-strong bg-white'}`}
                      >
                        {checked ? <Check className="size-3.5" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 break-words">{option.label}</span>
                    </label>
                  </li>
                )
              })}
              {visible.length ? null : (
                <li className="px-2 py-6 text-center text-xs text-muted">No options found</li>
              )}
            </ul>

            <footer className="grid shrink-0 grid-cols-2 gap-2.5 border-t border-line px-4 py-3">
              <button
                type="button"
                disabled={!values.length}
                onClick={() => onChange([])}
                className="h-11 rounded-xl border border-line-strong text-sm font-semibold text-maroon disabled:opacity-55"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={close}
                className="h-11 rounded-xl bg-maroon text-sm font-semibold text-white"
              >
                {values.length ? `Done (${values.length})` : 'Done'}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  )
}

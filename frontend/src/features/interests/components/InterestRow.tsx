import { useState } from 'react'
import type { ReactNode } from 'react'

import type { InterestEntry } from '@/features/interests/types'

interface InterestRowProps {
  entry: InterestEntry
  /** Buttons or status line rendered under the profile summary. */
  actions?: ReactNode
  /** Secondary line, e.g. when the interest was sent. */
  meta?: string
}

function formatDate(value: string): string | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/** One profile row inside either interest list. */
export function InterestRow({ entry, actions, meta }: InterestRowProps) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = Boolean(entry.photoUrl) && !photoFailed
  const sentLabel = entry.sentAt ? formatDate(entry.sentAt) : null
  // Only shown with an explicit label — the raw date's meaning differs per list.
  const timeLabel = meta ? (sentLabel ? `${meta} · ${sentLabel}` : meta) : null

  return (
    <li className="flex items-center gap-3.5 py-3.5">
      {showPhoto ? (
        <img
          src={entry.photoUrl ?? undefined}
          alt=""
          loading="lazy"
          onError={() => setPhotoFailed(true)}
          className="h-32 w-24 shrink-0 rounded-2xl object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-32 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-maroon to-maroon-dark text-2xl font-semibold text-white"
        >
          {entry.name.slice(0, 1)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-ink">{entry.name}</p>
        <p className="mt-1">
          <span className="inline-block rounded-full bg-rose px-2.5 py-0.5 text-xs font-semibold text-maroon">
            ID: {entry.id}
          </span>
        </p>
        <p className="mt-1.5 text-sm text-muted">
          {entry.age ? `${entry.age} yrs` : 'Age not provided'}
          {entry.location ? `, ${entry.location}` : ''}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted">
          {[entry.education, entry.occupation].filter(Boolean).join(', ') ||
            'Details not provided'}
        </p>
        {timeLabel ? (
          <p className="mt-1 text-sm font-medium text-maroon">{timeLabel}</p>
        ) : null}
        {actions}
      </div>
    </li>
  )
}

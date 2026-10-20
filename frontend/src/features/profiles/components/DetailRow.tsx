import { cn } from '@/lib/cn'
import { resolveMediaUrl } from '@/features/profiles/media'

interface DetailRowProps {
  label: string
  value: string | null
  /** When true the value is a media path rendered as an open link. */
  isMedia?: boolean
  className?: string
}

/**
 * One label/value line inside a detail section.
 *
 * A missing value renders a muted dash rather than collapsing the row, so the
 * shape of a section stays stable whether or not every field is filled in.
 * Media values (e.g. a horoscope chart path) render as a link to the resolved
 * absolute URL instead of a raw path.
 */
export function DetailRow({ label, value, isMedia = false, className }: DetailRowProps) {
  const mediaUrl = isMedia ? resolveMediaUrl(value) : null

  return (
    <div className={cn('flex items-start justify-between gap-4 py-2.5', className)}>
      <dt className="shrink-0 text-xs text-muted">{label}</dt>
      <dd
        className={cn(
          'min-w-0 text-right text-sm break-words',
          value ? 'text-ink' : 'text-muted/70',
        )}
      >
        {mediaUrl ? (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-maroon underline-offset-2 hover:underline"
          >
            View
          </a>
        ) : (
          (value ?? '—')
        )}
      </dd>
    </div>
  )
}

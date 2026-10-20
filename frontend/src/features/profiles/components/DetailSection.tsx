import type { ReactNode } from 'react'

import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { DetailRow } from '@/features/profiles/components/DetailRow'
import type { ProfileField } from '@/features/profiles/types'

interface DetailSectionProps {
  title: string
  fields: ProfileField[]
  /** Optional free-text blocks rendered below the rows. */
  notes?: ProfileField[]
  /** Optional content (empty state, extra card) rendered inside the section. */
  children?: ReactNode
}

/**
 * A titled card holding an ordered list of label/value rows plus optional
 * free-text notes. Shared by every profile detail screen so they stay visually
 * consistent.
 */
export function DetailSection({ title, fields, notes = [], children }: DetailSectionProps) {
  const visibleFields = fields.filter((field) => field.value !== null)
  const visibleNotes = notes.filter((note) => note.value !== null)
  const isEmpty = visibleFields.length === 0 && visibleNotes.length === 0 && !children

  return (
    <section>
      <SectionHeading title={title} />
      {visibleFields.length ? (
        <Card flush>
          <dl className="divide-y divide-line px-[var(--card-padding)]">
            {visibleFields.map((field) => (
              <DetailRow
                key={field.label}
                label={field.label}
                value={field.value}
                isMedia={field.isMedia}
              />
            ))}
          </dl>
        </Card>
      ) : null}

      {visibleNotes.length ? (
        <div className="mt-3 space-y-3">
          {visibleNotes.map((note) => (
            <Card key={note.label}>
              <p className="text-xs font-semibold text-muted">{note.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink">{note.value}</p>
            </Card>
          ))}
        </div>
      ) : null}

      {isEmpty ? (
        <Card>
          <p className="py-2 text-center text-sm text-muted">Not added yet.</p>
        </Card>
      ) : null}

      {children}
    </section>
  )
}

import { BadgeCheck, PencilLine } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { routes } from '@/config/routes'
import type { ProfileSummary } from '@/features/dashboard/types'

interface ProfileSummaryCardProps {
  summary: ProfileSummary
}

/**
 * The member's own profile at a glance.
 *
 * The verification badge is rendered only when the backend explicitly reports
 * verification, so an unverified profile never looks approved.
 */
export function ProfileSummaryCard({ summary }: ProfileSummaryCardProps) {
  const isComplete = summary.completion >= 100

  return (
    <section
      aria-label="Profile summary"
      className="relative overflow-hidden rounded-card bg-gradient-to-br from-maroon-dark via-maroon to-maroon-deep p-5 text-white shadow-lift"
    >
      {/* Decorative brand flourish. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-8 size-36 rounded-full bg-rose/15 blur-2xl"
      />

      <div className="relative flex items-start gap-4">
        <Avatar
          src={summary.photoUrl}
          name={summary.name}
          size="lg"
          className="ring-white/25"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-display text-lg text-white">{summary.name}</h2>
            {summary.isVerified === true ? (
              <Badge tone="brand" icon={<BadgeCheck className="size-3.5" />}>
                Verified
              </Badge>
            ) : null}
          </div>

          <p className="mt-0.5 text-xs text-white/70">
            Profile ID · {summary.profileId}
          </p>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-2xs text-white/75">
              <span>Profile completion</span>
              <span className="font-semibold text-white">{summary.completion}%</span>
            </div>
            <ProgressBar
              value={summary.completion}
              tone="onDark"
              label="Profile completion"
              className="bg-white/15"
            />
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="text-2xs leading-relaxed text-white/70">
          {isComplete
            ? 'Your profile is complete.'
            : `${summary.missingFields.length} details remaining.`}
        </p>

        <Link
          to={routes.profileEdit}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-2xs font-bold text-maroon shadow-soft transition hover:bg-rose active:scale-95"
        >
          <PencilLine className="size-3.5" aria-hidden="true" />
          Edit
        </Link>
      </div>
    </section>
  )
}

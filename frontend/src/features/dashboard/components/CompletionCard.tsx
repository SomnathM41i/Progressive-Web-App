import { CheckCircle2, CircleDot } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { ProfileSummary } from '@/features/dashboard/types'

interface CompletionCardProps {
  summary: ProfileSummary
}

/** Nudges the member towards a complete profile, which drives better matches. */
export function CompletionCard({ summary }: CompletionCardProps) {
  if (summary.missingFields.length === 0) {
    return (
      <Card className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Your profile is complete</p>
          <p className="mt-0.5 text-xs text-muted">
            You are ready to find more matches.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base text-maroon">Complete your profile</h2>
        <span className="text-sm font-bold text-saffron">{summary.completion}%</span>
      </div>

      <ProgressBar
        value={summary.completion}
        label="Profile completion"
        className="mt-2.5"
      />

      <ul className="mt-3.5 space-y-2">
        {summary.missingFields.map((field) => (
          <li key={field} className="flex items-center gap-2 text-xs text-muted">
            <CircleDot className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
            {field}
          </li>
        ))}
      </ul>
    </Card>
  )
}

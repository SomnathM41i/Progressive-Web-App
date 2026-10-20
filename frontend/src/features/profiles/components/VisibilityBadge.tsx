import { Eye, EyeOff } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'

interface VisibilityBadgeProps {
  setting: 'horoscope' | 'phone' | 'photo'
  value: string | null
}

/**
 * Turns a raw visibility setting into a friendly badge.
 *
 * The API stores short tokens (`paidhoro`, `paidphone`, `allphoto`) rather than
 * sentences, so each is mapped to a clear English label. Unrecognised values
 * fall back to showing the raw token instead of hiding information.
 */

const LABELS: Record<string, string> = {
  paidhoro: 'Visible to paid members',
  paidphone: 'Visible to paid members',
  allphoto: 'Visible to everyone',
  allhoro: 'Visible to everyone',
  allphone: 'Visible to everyone',
  all: 'Visible to everyone',
  none: 'Hidden',
  hidden: 'Hidden',
  private: 'Only me',
  public: 'Visible to everyone',
}

const HIDDEN_TOKENS = new Set(['none', 'hidden', 'private', 'no', '0'])

function labelFor(value: string | null): { text: string; hidden: boolean } {
  if (!value) return { text: 'Not set', hidden: true }
  const normalised = value.trim().toLowerCase()
  const hidden = HIDDEN_TOKENS.has(normalised)
  return { text: LABELS[normalised] ?? value, hidden }
}

export function VisibilityBadge({ setting, value }: VisibilityBadgeProps) {
  const { text, hidden } = labelFor(value)
  return (
    <Badge
      tone={hidden ? 'neutral' : 'success'}
      icon={
        hidden ? (
          <EyeOff className="size-3" aria-hidden="true" />
        ) : (
          <Eye className="size-3" aria-hidden="true" />
        )
      }
    >
      {text}
      <span className="sr-only"> — {setting} visibility</span>
    </Badge>
  )
}

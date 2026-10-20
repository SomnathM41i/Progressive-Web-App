import { BadgeCheck, MapPin, Sparkles } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

interface ProfileHeroProps {
  name: string
  profileId?: string | null
  photoUrl?: string | null
  location?: string | null
  /** Plan name when the member has an active membership. */
  planName?: string | null
  /** Short headline facts, e.g. `32 yrs · 5'6"`. */
  facts?: string[]
}

/**
 * Header card for the profile overview: photo, name, ID, location, plan badge
 * and a short list of key facts.
 */
export function ProfileHero({
  name,
  profileId,
  photoUrl,
  location,
  planName,
  facts = [],
}: ProfileHeroProps) {
  return (
    <Card className="flex items-start gap-4">
      <Avatar src={photoUrl} name={name} size="xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-ink">{name}</p>
            {profileId ? (
              <p className="mt-0.5 text-xs text-muted">Profile ID · {profileId}</p>
            ) : null}
          </div>
          {planName ? (
            <Badge tone="brand" icon={<Sparkles className="size-3" aria-hidden="true" />}>
              {planName}
            </Badge>
          ) : null}
        </div>

        {location ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <MapPin className="size-3.5" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </p>
        ) : null}

        {facts.length ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink">
            {facts.filter(Boolean).map((fact) => (
              <span key={fact} className="rounded-full bg-cream-dark px-2 py-0.5">
                {fact}
              </span>
            ))}
          </p>
        ) : null}

        <p className="mt-2 flex items-center gap-1 text-[11px] text-success">
          <BadgeCheck className="size-3.5" aria-hidden="true" />
          Your profile
        </p>
      </div>
    </Card>
  )
}

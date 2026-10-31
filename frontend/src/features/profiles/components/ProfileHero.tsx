import { Clock, MapPin, Sparkles } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

interface ProfileHeroProps {
  name: string
  profileId?: string | null
  photoUrl?: string | null
  /** The photo is only visible to the member until moderation approves it. */
  photoPending?: boolean
  location?: string | null
  /** Plan name, only passed while the membership is active. */
  planName?: string | null
  /** Short headline facts, e.g. `32 yrs · 5'6"`. */
  facts?: string[]
  /** Shows placeholders until the basic details resolve, avoiding a layout jump. */
  loading?: boolean
}

/**
 * Header card for the profile overview: photo, name, ID, location, plan badge
 * and a short list of key facts.
 */
export function ProfileHero({
  name,
  profileId,
  photoUrl,
  photoPending = false,
  location,
  planName,
  facts = [],
  loading = false,
}: ProfileHeroProps) {
  return (
    <Card className="flex items-start gap-4" aria-busy={loading}>
      <Avatar src={photoUrl} name={name} size="xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-5 w-40 rounded-full" />
            ) : (
              <p className="truncate text-lg font-semibold text-ink">{name}</p>
            )}
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

        {loading ? (
          <>
            <Skeleton className="mt-2.5 h-3 w-32 rounded-full" />
            <Skeleton className="mt-2.5 h-5 w-44 rounded-full" />
          </>
        ) : (
          <>
            {location ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{location}</span>
              </p>
            ) : null}

            {facts.length ? (
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink">
                {facts.map((fact) => (
                  <span key={fact} className="rounded-full bg-cream-dark px-2 py-0.5">
                    {fact}
                  </span>
                ))}
              </p>
            ) : null}
          </>
        )}

        {photoUrl && photoPending ? (
          <p className="mt-2 flex items-center gap-1 text-2xs text-muted">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            Photo pending approval
          </p>
        ) : null}
      </div>
    </Card>
  )
}

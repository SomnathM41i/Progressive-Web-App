import { BadgeCheck, MapPin } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import type { ProfilePreview } from '@/features/dashboard/types'

interface ProfilePreviewCardProps {
  profile: ProfilePreview
}

/** Compact match card used in the horizontally scrolling dashboard rails. */
export function ProfilePreviewCard({ profile }: ProfilePreviewCardProps) {
  return (
    <article className="w-40 shrink-0 snap-start overflow-hidden rounded-card border border-line bg-surface shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-card">
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-cream-dark to-cream">
        <Avatar src={profile.photoUrl} name={profile.name} size="xl" />
        {profile.isNew ? (
          <span className="absolute top-2 left-2 rounded-full bg-saffron px-2 py-0.5 text-2xs font-bold text-white shadow-sm">
            New
          </span>
        ) : null}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-sm font-semibold text-ink">{profile.name}</h3>
          {profile.isVerified === true ? (
            <BadgeCheck
              className="size-3.5 shrink-0 text-gold"
              aria-label="Verified profile"
            />
          ) : null}
        </div>

        <p className="mt-0.5 text-2xs text-muted">
          {profile.age} yrs
          {profile.occupation ? ` · ${profile.occupation}` : ''}
        </p>

        <p className="mt-1.5 flex items-center gap-1 text-2xs text-muted">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{profile.location}</span>
        </p>
      </div>
    </article>
  )
}

interface ProfileRailProps {
  profiles: ProfilePreview[]
}

/** Horizontal, snap-scrolling list of profile cards. */
export function ProfileRail({ profiles }: ProfileRailProps) {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {profiles.map((profile) => (
        <li key={profile.id}>
          <ProfilePreviewCard profile={profile} />
        </li>
      ))}
    </ul>
  )
}

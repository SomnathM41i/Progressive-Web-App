import { BadgeCheck, Bookmark, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { IconButton } from '@/components/ui/IconButton'
import { profilePath } from '@/config/routes'
import type { ProfilePreview } from '@/features/profiles/types'
import { useShortlist } from '@/features/shortlist/hooks/useShortlist'
import { cn } from '@/lib/cn'

interface ProfileCardProps {
  profile: ProfilePreview
  className?: string
}

/**
 * Match card shown in the dashboard rails, search results and the shortlist.
 *
 * The whole card navigates to the profile; the bookmark control sits above the
 * link overlay so tapping it shortlists without leaving the list.
 */
export function ProfileCard({ profile, className }: ProfileCardProps) {
  const { isShortlisted, toggle } = useShortlist()
  const saved = isShortlisted(profile.id)

  return (
    <article
      className={cn(
        'group relative w-40 shrink-0 overflow-hidden rounded-card border border-line bg-surface shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-card',
        className,
      )}
    >
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-rose to-rose-dark">
        <Avatar src={profile.photoUrl} name={profile.name} size="xl" />

        {profile.isNew ? (
          <span className="absolute top-2 left-2 rounded-full bg-maroon px-2 py-0.5 text-2xs font-bold text-white shadow-sm">
            New
          </span>
        ) : null}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-sm font-semibold text-ink">{profile.name}</h3>
          {profile.isVerified === true ? (
            <BadgeCheck
              className="size-3.5 shrink-0 text-success"
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

      <IconButton
        label={saved ? 'Remove from shortlist' : 'Add to shortlist'}
        size="sm"
        aria-pressed={saved}
        onClick={() => toggle(profile)}
        className={cn(
          'absolute top-2 right-2 z-10 shadow-soft',
          saved
            ? 'bg-maroon text-white hover:bg-maroon-dark'
            : 'bg-white text-maroon hover:bg-rose',
        )}
      >
        <Bookmark
          className={cn('size-4', saved && 'fill-current')}
          aria-hidden="true"
        />
      </IconButton>

      <Link
        to={profilePath(profile.id)}
        state={{ profile }}
        aria-label={`View ${profile.name}'s profile`}
        className="absolute inset-0 rounded-card focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </article>
  )
}

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
 * Full-bleed match card: the photo covers the whole card and the profile
 * summary sits on a gradient scrim at the bottom, over the image.
 *
 * List screens show one card per row; the dashboard rails give it a fixed
 * width. The whole card navigates to the profile; the bookmark control sits
 * above the link overlay so tapping it shortlists without leaving the list.
 */
export function ProfileCard({ profile, className }: ProfileCardProps) {
  const { isShortlisted, toggle } = useShortlist()
  const saved = isShortlisted(profile.id)

  return (
    <article
      className={cn(
        'group relative h-64 w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-card',
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose to-rose-dark">
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover object-[center_30%]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Avatar name={profile.name} size="xl" />
          </div>
        )}
      </div>

      {profile.isNew ? (
        <span className="absolute top-2 left-2 rounded-full bg-maroon px-2 py-0.5 text-2xs font-bold text-white shadow-sm">
          New
        </span>
      ) : null}

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
          className={cn('size-5', saved && 'fill-current')}
          aria-hidden="true"
        />
      </IconButton>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 pt-12">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-base font-semibold text-white drop-shadow-sm">
            {profile.name}
          </h3>
          {profile.isVerified === true ? (
            <BadgeCheck
              className="size-4 shrink-0 text-white drop-shadow-sm"
              aria-label="Verified profile"
            />
          ) : null}
        </div>

        <p className="mt-0.5 truncate text-sm text-white/85">
          {profile.age > 0 ? `${profile.age} yrs` : 'Age not specified'}
          {profile.occupation ? ` · ${profile.occupation}` : ''}
        </p>

        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{profile.location}</span>
        </p>
      </div>

      <Link
        to={profilePath(profile.id)}
        state={{ profile }}
        aria-label={`View ${profile.name}'s profile`}
        className="absolute inset-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </article>
  )
}

import { BadgeCheck, Bookmark, ChevronLeft, MapPin, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ComingSoon } from '@/components/states/ComingSoon'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { routes } from '@/config/routes'
import type { ProfilePreview } from '@/features/profiles/types'
import { useShortlist } from '@/features/shortlist/hooks/useShortlist'

interface DetailState {
  profile?: ProfilePreview
}

/**
 * Full profile screen.
 *
 * The list cards pass the profile through router state, so a card tap never
 * lands on an empty screen. The sections that need real records (education,
 * family, photos) show a placeholder until the API collection exists.
 */
export function ProfileDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isShortlisted, toggle } = useShortlist()

  const profile = (location.state as DetailState | null)?.profile

  return (
    <div className="px-4 pt-4 pb-6">
      <button
        type="button"
        aria-label="Back"
        onClick={() => void navigate(-1)}
        className="mb-3 -ml-2 flex size-9 items-center justify-center rounded-full text-maroon transition hover:bg-rose"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>

      {profile ? (
        <div className="space-y-4">
          <Card flush className="overflow-hidden">
            <div className="flex h-40 items-center justify-center bg-gradient-to-br from-rose to-rose-dark">
              <Avatar src={profile.photoUrl} name={profile.name} size="xl" />
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl text-ink">{profile.name}</h1>
                {profile.isVerified === true ? (
                  <Badge tone="success" icon={<BadgeCheck className="size-3.5" />}>
                    Verified
                  </Badge>
                ) : null}
              </div>

              <p className="mt-1 text-sm text-muted">
                {profile.age} yrs
                {profile.occupation ? ` · ${profile.occupation}` : ''}
              </p>

              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {profile.location}
              </p>

              <Button
                fullWidth
                className="mt-5"
                variant={isShortlisted(profile.id) ? 'outline' : 'primary'}
                leadingIcon={
                  <Bookmark
                    className="size-4"
                    aria-hidden="true"
                    fill={isShortlisted(profile.id) ? 'currentColor' : 'none'}
                  />
                }
                onClick={() => toggle(profile)}
              >
                {isShortlisted(profile.id) ? 'Shortlisted' : 'Add to shortlist'}
              </Button>
            </div>
          </Card>

          <ComingSoon
            title="Full profile"
            description="Education, family details and photos will appear here once the API collection is connected."
          />
        </div>
      ) : (
        <ComingSoon
          title="Profile details"
          description="Open a profile from the dashboard or search to see its details here."
          action={
            <Link
              to={routes.home}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon hover:text-maroon-dark"
            >
              <UserRound className="size-3.5" aria-hidden="true" />
              Back to dashboard
            </Link>
          }
        />
      )}
    </div>
  )
}

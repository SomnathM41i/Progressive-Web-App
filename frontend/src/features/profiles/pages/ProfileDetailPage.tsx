import {
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  ChevronLeft,
  GraduationCap,
  Heart,
  MapPin,
  Ruler,
  UserRound,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ComingSoon } from '@/components/states/ComingSoon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { routes } from '@/config/routes'
import type { ProfileDetail } from '@/features/profiles/types'
import { useShortlist } from '@/features/shortlist/hooks/useShortlist'
import { useToast } from '@/hooks/useToast'

interface DetailState {
  profile?: ProfileDetail
}

export function ProfileDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isShortlisted, toggle } = useShortlist()
  const toast = useToast()
  const profile = (location.state as DetailState | null)?.profile

  return (
    <div className="px-4 pt-4 pb-6">
      <button
        type="button"
        aria-label="Back"
        onClick={() => void navigate(-1)}
        className="mb-3 -ml-2 flex size-9 items-center justify-center rounded-full text-maroon transition hover:bg-rose"
      >
        <ChevronLeft className="size-5" />
      </button>
      {profile ? (
        <div className="space-y-4">
          <Card flush className="overflow-hidden">
            <div className="relative h-72 bg-gradient-to-br from-rose to-rose-dark">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={`${profile.name}'s profile`}
                  className="size-full object-cover object-center"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <UserRound className="size-20 text-maroon/40" />
                </div>
              )}
              <span className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
                Profile photo
              </span>
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
                {profile.age} yrs · {profile.height ?? 'Height not provided'}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="size-3.5 shrink-0" />
                {profile.location}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  fullWidth
                  className="text-xs"
                  variant={isShortlisted(profile.id) ? 'outline' : 'primary'}
                  leadingIcon={
                    <Bookmark
                      className="size-4"
                      fill={isShortlisted(profile.id) ? 'currentColor' : 'none'}
                    />
                  }
                  onClick={() => toggle(profile)}
                >
                  {isShortlisted(profile.id) ? 'Saved' : 'Save profile'}
                </Button>
                <Button
                  variant="outline"
                  className="text-xs"
                  leadingIcon={<Heart className="size-4" />}
                  onClick={() =>
                    toast.info(
                      'Interest requests will be available when your account is connected',
                    )
                  }
                >
                  Send interest
                </Button>
              </div>
            </div>
          </Card>
          <Card>
            <h2 className="text-base font-semibold text-maroon">Personal details</h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              {[
                {
                  label: 'Height',
                  value: profile.height ?? 'Not provided',
                  icon: Ruler,
                },
                {
                  label: 'Education',
                  value: profile.education ?? 'Not provided',
                  icon: GraduationCap,
                },
                {
                  label: 'Occupation',
                  value: profile.occupation ?? 'Not provided',
                  icon: BriefcaseBusiness,
                },
                {
                  label: 'Marital status',
                  value: profile.maritalStatus ?? 'Not provided',
                  icon: Heart,
                },
                { label: 'Location', value: profile.location, icon: MapPin },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Icon className="size-4 shrink-0 text-maroon" />
                  <dt className="w-28 shrink-0 text-muted">{label}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <p className="text-center text-xs text-muted">
            Profile preview. Details are sample content.
          </p>
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
              <UserRound className="size-3.5" />
              Back to dashboard
            </Link>
          }
        />
      )}
    </div>
  )
}

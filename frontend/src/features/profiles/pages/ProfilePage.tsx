import {
  Briefcase,
  Contact,
  FileText,
  Heart,
  Image as ImageIcon,
  LogOut,
  Moon,
  PencilLine,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { Button } from '@/components/ui/Button'
import { IconLink } from '@/components/ui/IconButton'
import { ErrorState } from '@/components/states/ErrorState'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ProfileHero } from '@/features/profiles/components/ProfileHero'
import {
  ProfileSectionList,
  type ProfileSectionLink,
} from '@/features/profiles/components/ProfileSectionList'
import { useMyPhoto } from '@/features/profiles/hooks/useMyPhoto'
import { useProfileResource } from '@/features/profiles/hooks/useProfileResource'
import { profileService } from '@/features/profiles/services/profile.service'
import type { MembershipPlan, ProfileSection } from '@/features/profiles/types'
import { useToast } from '@/hooks/useToast'

const EMPTY_SECTION: ProfileSection = { fields: [], notes: [] }
const EMPTY_PLAN: MembershipPlan = {
  planName: null,
  activationDate: null,
  expiryDate: null,
  durationDays: null,
  amount: null,
  totalContacts: null,
  remainingContacts: null,
  paymentMode: null,
  invoiceId: null,
}

/** Reads a field value by label from a section, for the row summaries. */
function fieldValue(section: ProfileSection | null, label: string): string | null {
  return section?.fields.find((field) => field.label === label)?.value ?? null
}

function join(values: Array<string | null | undefined>): string | null {
  const parts = values.filter((value): value is string => Boolean(value))
  return parts.length ? parts.join(' · ') : null
}

/**
 * My Profile overview.
 *
 * A hub that summarises the member's profile and links to a dedicated screen
 * for each section. All data comes from read endpoints; nothing here changes
 * server state.
 */
export function ProfilePage() {
  const { user, logout } = useAuth()
  const { photoUrl } = useMyPhoto()
  const toast = useToast()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const basic = useProfileResource<ProfileSection>(profileService.fetchBasic, EMPTY_SECTION)
  const membership = useProfileResource<MembershipPlan>(profileService.fetchMembership, EMPTY_PLAN)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      toast.info('Logged out')
      void navigate(routes.welcome, { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  const basicData = basic.data
  const basicLoading = basic.status === 'loading'
  const plan = membership.data
  const membershipLoading = membership.status === 'loading'

  // The basic-details call drives the whole overview (name, id, facts). If it
  // fails, show a proper error instead of a silently empty profile.
  const overviewFailed = basic.status === 'error'

  const name = fieldValue(basicData, 'Name') ?? user?.name ?? 'Member'
  const profileId = fieldValue(basicData, 'Profile ID') ?? user?.profileId ?? null
  const facts = [
    fieldValue(basicData, 'Age') ? `${fieldValue(basicData, 'Age')} yrs` : null,
    fieldValue(basicData, 'Height'),
    fieldValue(basicData, 'Marital status'),
  ].filter((fact): fact is string => Boolean(fact))

  const location = join([
    fieldValue(basicData, 'City'),
    fieldValue(basicData, 'District'),
    fieldValue(basicData, 'State'),
  ])

  const basicSummary = join([
    fieldValue(basicData, 'Gender'),
    fieldValue(basicData, 'Religion'),
    fieldValue(basicData, 'Caste'),
  ])

  const links: ProfileSectionLink[] = [
    {
      label: 'Basic details',
      to: routes.profileBasic,
      icon: UserRound,
      summary: basicSummary,
      loading: basicLoading,
    },
    { label: 'Contact details', to: routes.profileContact, icon: Contact, summary: location },
    { label: 'Education & career', to: routes.profileEducation, icon: Briefcase, summary: null },
    { label: 'Family details', to: routes.profileFamily, icon: Users, summary: null },
    { label: 'Horoscope', to: routes.profileHoroscope, icon: Moon, summary: null },
    {
      label: 'Partner preference',
      to: routes.profilePartnerPreference,
      icon: Heart,
      summary: null,
    },
    { label: 'Photos', to: routes.profilePhotos, icon: ImageIcon, summary: null },
    { label: 'Documents', to: routes.profileDocuments, icon: FileText, summary: null },
    { label: 'Biodata', to: routes.profileBiodata, icon: ScrollText, summary: null },
    {
      label: 'Privacy settings',
      to: routes.profileSettings,
      icon: ShieldCheck,
      summary: null,
    },
    {
      label: 'Membership',
      to: routes.profileMembership,
      icon: Sparkles,
      summary: membershipLoading ? null : (plan?.planName ?? null),
      loading: membershipLoading,
    },
  ]

  return (
    <AppScreen>
      <ScreenHeader
        title="My profile"
        trailing={
          <IconLink to={routes.profileEdit} label="Edit profile" size="sm" variant="plain">
            <PencilLine className="size-4" aria-hidden="true" />
          </IconLink>
        }
      />

      <main className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4">
        {overviewFailed ? (
          <div className="pt-6">
            <ErrorState
              title="Could not load your profile"
              description={basic.error ?? undefined}
              onRetry={basic.reload}
            />
          </div>
        ) : (
          <>
            <ProfileHero
              name={name}
              profileId={profileId}
              photoUrl={photoUrl ?? user?.avatarUrl}
              location={location}
              planName={plan?.planName}
              facts={facts}
            />

            {membership.status === 'error' ? (
              <p className="rounded-card border border-line bg-white px-4 py-3 text-xs text-muted">
                Membership details could not be loaded.
              </p>
            ) : null}

            <ProfileSectionList links={links} />

            <p className="flex items-center justify-center gap-1.5 pt-1 text-2xs text-muted">
              <UserRound className="size-3.5" aria-hidden="true" />
              Shivaraj Maratha Matrimony
            </p>
          </>
        )}
      </main>

      <footer className="shrink-0 border-t border-line bg-white px-4 py-3">
        <Button
          variant="outline"
          fullWidth
          disabled={loggingOut}
          onClick={() => void handleLogout()}
          leadingIcon={<LogOut className="size-4" aria-hidden="true" />}
        >
          {loggingOut ? 'Logging out…' : 'Log out'}
        </Button>
      </footer>
    </AppScreen>
  )
}

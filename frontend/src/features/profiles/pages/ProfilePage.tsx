import {
  Briefcase,
  Contact,
  Eye,
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
import { business } from '@/config/business'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { planTitle } from '@/features/membership/format'
import { ProfileHero } from '@/features/profiles/components/ProfileHero'
import {
  ProfileSectionList,
  type ProfileSectionLink,
} from '@/features/profiles/components/ProfileSectionList'
import { formatApiDate, membershipStatus } from '@/features/profiles/dates'
import { useMyPhoto } from '@/features/profiles/hooks/useMyPhoto'
import { useProfileResource } from '@/features/profiles/hooks/useProfileResource'
import { profileService } from '@/features/profiles/services/profile.service'
import type { MembershipPlan, ProfileSection } from '@/features/profiles/types'
import type { AsyncResource } from '@/hooks/useAsyncResource'
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

function join(values: Array<string | null | undefined>, separator = ' · '): string | null {
  const parts = values.filter((value): value is string => Boolean(value))
  return parts.length ? parts.join(separator) : null
}

/**
 * Row summary for a section resource: `undefined` (no line) until it has
 * loaded successfully, then the summary or `null` ("Not added yet").
 */
function summaryOf(
  resource: AsyncResource<ProfileSection>,
  build: (section: ProfileSection) => string | null,
): string | null | undefined {
  if (resource.status !== 'ready' || !resource.data) return undefined
  return build(resource.data)
}

function photoSummary(count: number | null, pending: boolean): string | null | undefined {
  if (count === null) return undefined
  if (count === 0) return null
  const label = `${count} ${count === 1 ? 'photo' : 'photos'}`
  return pending ? `${label} · Pending approval` : label
}

/** Plan title plus validity, e.g. `12 months · Active till 6 Oct 2027`. */
function membershipSummary(plan: MembershipPlan | null): string {
  if (!plan?.planName) return 'No active plan'

  const title = planTitle(plan.planName)
  const expiry = formatApiDate(plan.expiryDate)
  const { tone } = membershipStatus(plan.expiryDate)

  if (tone === 'active') return expiry ? `${title} · Active till ${expiry}` : title
  if (tone === 'expired') return expiry ? `${title} · Expired on ${expiry}` : `${title} · Expired`
  return title
}

/**
 * My Profile overview.
 *
 * A hub that summarises the member's profile and links to a dedicated screen
 * for each section. All data comes from read endpoints; nothing here changes
 * server state. Only cheap summaries are loaded (basic, contact, education,
 * membership, plus the shared gallery); rows without one show no subtitle
 * rather than claiming the section is empty.
 */
export function ProfilePage() {
  const { user, logout } = useAuth()
  const { photoUrl, photoPending, photoCount } = useMyPhoto()
  const toast = useToast()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const basic = useProfileResource<ProfileSection>(profileService.fetchBasic, EMPTY_SECTION)
  const contact = useProfileResource<ProfileSection>(profileService.fetchContact, EMPTY_SECTION)
  const education = useProfileResource<ProfileSection>(
    profileService.fetchEducation,
    EMPTY_SECTION,
  )
  const membership = useProfileResource<MembershipPlan>(profileService.fetchMembership, EMPTY_PLAN)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      toast.info('Logged out')
      void navigate(routes.welcome, { replace: true })
    } catch {
      toast.error('Could not log out. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  const basicData = basic.data
  const basicLoading = basic.status === 'loading'
  const plan = membership.data
  const membershipLoading = membership.status === 'loading'
  const planActive = membershipStatus(plan?.expiryDate).tone === 'active'

  // The basic-details call drives the whole overview (name, id, facts). If it
  // fails, show a proper error instead of a silently empty profile.
  const overviewFailed = basic.status === 'error'

  const name = fieldValue(basicData, 'Name') ?? user?.name ?? 'Member'
  const profileId = fieldValue(basicData, 'Profile ID') ?? user?.profileId ?? null
  const age = fieldValue(basicData, 'Age')
  const facts = [
    age ? `${age} yrs` : null,
    fieldValue(basicData, 'Height'),
    fieldValue(basicData, 'Marital status'),
  ].filter((fact): fact is string => Boolean(fact))

  // Location lives in contact details; basic details carry none. City is often
  // blank, so taluka stands in for it.
  const contactData = contact.data
  const location = join(
    [
      fieldValue(contactData, 'City') ?? fieldValue(contactData, 'Taluka'),
      fieldValue(contactData, 'District'),
      fieldValue(contactData, 'State'),
    ],
    ', ',
  )

  const links: ProfileSectionLink[] = [
    {
      label: 'Basic details',
      to: routes.profileBasic,
      icon: UserRound,
      summary: summaryOf(basic, (section) =>
        join([
          fieldValue(section, 'Gender'),
          fieldValue(section, 'Religion'),
          fieldValue(section, 'Caste'),
        ]),
      ),
      loading: basicLoading,
    },
    {
      label: 'Contact details',
      to: routes.profileContact,
      icon: Contact,
      summary: summaryOf(contact, () => location),
      loading: contact.status === 'loading',
    },
    {
      label: 'Education & career',
      to: routes.profileEducation,
      icon: Briefcase,
      summary: summaryOf(education, (section) =>
        join([fieldValue(section, 'Education'), fieldValue(section, 'Occupation')]),
      ),
      loading: education.status === 'loading',
    },
    { label: 'Family details', to: routes.profileFamily, icon: Users },
    { label: 'Horoscope', to: routes.profileHoroscope, icon: Moon },
    { label: 'Partner preference', to: routes.profilePartnerPreference, icon: Heart },
    {
      label: 'Photos',
      to: routes.profilePhotos,
      icon: ImageIcon,
      summary: photoSummary(photoCount, photoPending),
    },
    { label: 'Documents', to: routes.profileDocuments, icon: FileText },
    { label: 'Biodata', to: routes.profileBiodata, icon: ScrollText },
    { label: 'Profile views', to: routes.profileViews, icon: Eye },
    { label: 'Privacy settings', to: routes.profileSettings, icon: ShieldCheck },
    {
      label: 'Membership',
      to: routes.profileMembership,
      icon: Sparkles,
      summary: membership.status === 'ready' ? membershipSummary(plan) : undefined,
      loading: membershipLoading,
    },
  ]

  return (
    <AppScreen safeBottom={false}>
      <ScreenHeader
        title="My profile"
        showBack={false}
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
              photoPending={photoPending}
              location={location}
              planName={planActive && plan?.planName ? planTitle(plan.planName) : null}
              facts={facts}
              loading={basicLoading || contact.status === 'loading'}
            />

            {membership.status === 'error' ? (
              <p className="rounded-card border border-line bg-white px-4 py-3 text-xs text-muted">
                Membership details could not be loaded.
              </p>
            ) : null}

            <ProfileSectionList links={links} />

            <p className="pt-1 text-center text-2xs text-muted">
              {business.name} · {business.subBrand}
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

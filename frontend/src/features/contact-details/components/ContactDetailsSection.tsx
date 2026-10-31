import { useState, type ReactNode } from 'react'
import { Lock, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Spinner } from '@/components/loading/Spinner'
import { ErrorState } from '@/components/states/ErrorState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { routes } from '@/config/routes'
import { contactDetailsService } from '@/features/contact-details/services/contact-details.service'
import type { ContactDetails } from '@/features/contact-details/types'
import { membershipStatus } from '@/features/profiles/dates'
import { profileService } from '@/features/profiles/services/profile.service'
import { useAsyncResource } from '@/hooks/useAsyncResource'
import { useToast } from '@/hooks/useToast'
import { toApiError } from '@/services/api-error'

interface ContactDetailsSectionProps {
  /** The signed-in member. */
  memberId: string
  /** The profile being viewed. */
  profileId: string
}

function ContactRow({ label, value }: { label: string; value: ReactNode }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-xs text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-sm break-words whitespace-pre-line text-ink">
        {value}
      </dd>
    </div>
  )
}

function ContactLink({ href, icon, value }: { href: string; icon: ReactNode; value: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-1.5 font-semibold text-maroon">
      {icon}
      {value}
    </a>
  )
}

function phoneLink(value: string | null): ReactNode {
  if (!value) return null
  return (
    <ContactLink
      href={`tel:${value}`}
      icon={<Phone className="size-3.5" aria-hidden="true" />}
      value={value}
    />
  )
}

function LockedCard({ title, description, action }: {
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose text-maroon">
          <Lock className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-3">{action}</div>
    </Card>
  )
}

const plansLink = (label: string) => (
  <Link
    to={routes.membership}
    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-maroon px-4 text-sm font-semibold text-white shadow-brand hover:bg-maroon-dark"
  >
    {label}
  </Link>
)

/**
 * Contact details on another member's profile, gated by the member's plan.
 *
 * Already-unlocked profiles show immediately and cost nothing. Otherwise an
 * active plan with contacts remaining gets an explicit unlock button stating
 * the cost; the server stays the final authority and its refusal is surfaced.
 * Contact data is kept in memory only, never in browser storage.
 */
export function ContactDetailsSection({ memberId, profileId }: ContactDetailsSectionProps) {
  const toast = useToast()
  const [unlocked, setUnlocked] = useState<ContactDetails | null>(null)
  const [unlocking, setUnlocking] = useState(false)

  const access = useAsyncResource(async () => {
    // Contacts already paid for must show even if the plan lookup fails.
    const existing = await contactDetailsService.findUnlocked(memberId, profileId)
    if (existing) return { existing, plan: null }
    return { existing, plan: await profileService.fetchMembership(memberId) }
  }, [memberId, profileId])

  async function handleUnlock() {
    if (unlocking) return
    setUnlocking(true)
    try {
      setUnlocked(await contactDetailsService.unlock(memberId, profileId))

      const remaining = Number(access.data?.plan?.remainingContacts)
      toast.success('Contact details unlocked', {
        description: Number.isFinite(remaining) && remaining > 0
          ? `1 contact view used. ${remaining - 1} left.`
          : '1 contact view used.',
      })
    } catch (error) {
      toast.error('Could not view contact details', {
        description: toApiError(error).message,
      })
    } finally {
      setUnlocking(false)
    }
  }

  function renderBody() {
    if (access.status === 'loading') {
      return (
        <Card>
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted">
            <Spinner className="size-4" />
            Checking contact access…
          </div>
        </Card>
      )
    }

    if (access.status === 'error' || !access.data) {
      return (
        <ErrorState
          title="Contact details unavailable"
          description={access.error ?? undefined}
          onRetry={access.reload}
        />
      )
    }

    const contact = unlocked ?? access.data.existing

    if (contact) {
      return (
        <Card flush>
          <dl className="divide-y divide-line/70 px-[var(--card-padding)]">
            <ContactRow label="Full name" value={contact.name} />
            <ContactRow label="Mobile" value={phoneLink(contact.mobile)} />
            <ContactRow label="Alternate mobile" value={phoneLink(contact.alternateMobile)} />
            <ContactRow
              label="Email"
              value={
                contact.email ? (
                  <ContactLink
                    href={`mailto:${contact.email}`}
                    icon={<Mail className="size-3.5" aria-hidden="true" />}
                    value={contact.email}
                  />
                ) : null
              }
            />
            <ContactRow label="Father's name" value={contact.fatherName} />
            <ContactRow label="Mother's name" value={contact.motherName} />
            <ContactRow label="Date of birth" value={contact.dateOfBirth} />
            <ContactRow label="Place of birth" value={contact.placeOfBirth} />
            <ContactRow label="Time of birth" value={contact.timeOfBirth} />
            <ContactRow label="Address" value={contact.address} />
            <ContactRow label="Work address" value={contact.workAddress} />
          </dl>
        </Card>
      )
    }

    const { plan } = access.data

    if (!plan?.planName) {
      return (
        <LockedCard
          title="Contact details are locked"
          description="Get a membership plan to view this member's contact details."
          action={plansLink('View plans')}
        />
      )
    }

    // Only a known past date locks; an unreadable one is left to the server.
    if (membershipStatus(plan.expiryDate).tone === 'expired') {
      return (
        <LockedCard
          title="Your membership is not active"
          description="Renew your plan to view contact details."
          action={plansLink('Renew plan')}
        />
      )
    }

    const remaining = plan.remainingContacts === null ? null : Number(plan.remainingContacts)
    const knownRemaining = remaining !== null && Number.isFinite(remaining) ? remaining : null

    if (knownRemaining !== null && knownRemaining <= 0) {
      return (
        <LockedCard
          title="No contact views left"
          description="You have used all the contact views in your plan."
          action={plansLink('Upgrade plan')}
        />
      )
    }

    return (
      <LockedCard
        title="Contact details are hidden"
        description={
          knownRemaining !== null
            ? `Viewing uses 1 contact view. You have ${knownRemaining} left.`
            : 'Viewing uses 1 contact view from your plan.'
        }
        action={
          <Button
            fullWidth
            disabled={unlocking}
            onClick={() => void handleUnlock()}
            leadingIcon={unlocking ? <Spinner className="size-4" /> : undefined}
          >
            {unlocking ? 'Loading…' : 'View contact details'}
          </Button>
        }
      />
    )
  }

  return (
    <section className="px-4 pt-5">
      <SectionHeading title="Contact details" />
      {renderBody()}
    </section>
  )
}

import { BadgeCheck, Crown, Clock, XCircle } from 'lucide-react'

import { EmptyState } from '@/components/states/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { DetailRow } from '@/features/profiles/components/DetailRow'
import { SectionState } from '@/features/profiles/components/SectionState'
import { planTitle } from '@/features/membership/format'
import { formatApiDate, membershipStatus } from '@/features/profiles/dates'
import { useProfileResource } from '@/features/profiles/hooks/useProfileResource'
import { profileService } from '@/features/profiles/services/profile.service'
import type { MembershipPlan } from '@/features/profiles/types'

const EMPTY: MembershipPlan = {
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

export function ProfileMembershipPage() {
  const { status, data, error, reload } = useProfileResource<MembershipPlan>(
    profileService.fetchMembership,
    EMPTY,
  )

  const plan = data ?? EMPTY
  const hasPlan = Boolean(plan.planName || plan.activationDate || plan.expiryDate)
  const planStatus = membershipStatus(plan.expiryDate)

  return (
    <SectionState title="My membership" status={status} error={error} reload={reload} skeletonRows={5}>
      {hasPlan ? (
        <>
          <Card className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rose text-maroon">
              <Crown className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-ink">
                {plan.planName ? planTitle(plan.planName) : 'Membership plan'}
              </p>
              {plan.expiryDate ? (
                <p className="mt-0.5 text-xs text-muted">
                  {planStatus.tone === 'expired' ? 'Expired on ' : 'Valid until '}
                  {formatApiDate(plan.expiryDate) ?? plan.expiryDate}
                </p>
              ) : null}
            </div>
            {planStatus.tone === 'active' ? (
              <Badge tone="success" icon={<BadgeCheck className="size-3" aria-hidden="true" />}>
                {planStatus.label}
              </Badge>
            ) : planStatus.tone === 'expired' ? (
              <Badge tone="danger" icon={<XCircle className="size-3" aria-hidden="true" />}>
                {planStatus.label}
              </Badge>
            ) : (
              <Badge tone="neutral" icon={<Clock className="size-3" aria-hidden="true" />}>
                Unknown
              </Badge>
            )}
          </Card>

          <section>
            <SectionHeading title="Plan details" />
            <Card flush>
              <dl className="divide-y divide-line px-[var(--card-padding)]">
                <DetailRow label="Activated on" value={formatApiDate(plan.activationDate)} />
                <DetailRow label="Expires on" value={formatApiDate(plan.expiryDate)} />
                <DetailRow label="Duration" value={plan.durationDays ? `${plan.durationDays} days` : null} />
                <DetailRow label="Amount" value={plan.amount} />
                <DetailRow label="Contacts total" value={plan.totalContacts} />
                <DetailRow label="Contacts remaining" value={plan.remainingContacts} />
                <DetailRow label="Payment mode" value={plan.paymentMode} />
                <DetailRow label="Invoice" value={plan.invoiceId} />
              </dl>
            </Card>
          </section>
        </>
      ) : (
        <EmptyState
          icon={<Crown className="size-6" aria-hidden="true" />}
          title="No active membership"
          description="When you purchase a plan, your membership details will appear here."
        />
      )}
    </SectionState>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Check, Crown } from 'lucide-react'

import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { AppScreen } from '@/components/ui/AppScreen'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { env } from '@/config/env'
import { CheckoutSheet } from '@/features/membership/components/CheckoutSheet'
import { formatAmount, planMeta, planTitle } from '@/features/membership/format'
import {
  membershipService,
  type MembershipPlanOffer,
} from '@/features/membership/services/membership.service'

function PlanCard({
  plan,
  onSelect,
}: {
  plan: MembershipPlanOffer
  onSelect: (plan: MembershipPlanOffer) => void
}) {
  const title = planTitle(plan.name)
  const meta = planMeta(plan)

  return (
    <Card flush className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-line bg-cream/70 px-4 py-3.5">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-maroon">{title}</p>
          {meta ? <p className="mt-0.5 text-xs text-muted">{meta}</p> : null}
        </div>
        <p className="shrink-0 text-xl font-bold tracking-tight text-ink">
          {formatAmount(plan.amount)}
        </p>
      </div>

      {plan.features.length ? (
        <ul className="flex-1 space-y-2 px-4 py-3.5">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm leading-snug text-ink"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-maroon"
                strokeWidth={2.6}
                aria-hidden="true"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex-1 px-4 py-3.5 text-xs text-muted">
          Plan details are available from the centre.
        </p>
      )}

      <div className="border-t border-line px-4 py-3">
        <Button fullWidth size="sm" onClick={() => onSelect(plan)}>
          Choose plan
        </Button>
      </div>
    </Card>
  )
}

function PlanSkeleton() {
  return (
    <div className="animate-pulse rounded-card border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-rose" />
          <div className="h-3 w-32 rounded bg-rose/70" />
        </div>
        <div className="h-6 w-20 rounded bg-rose" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-3 rounded bg-rose/50" />
        ))}
      </div>
    </div>
  )
}

export function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlanOffer[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [checkoutPlan, setCheckoutPlan] = useState<MembershipPlanOffer | null>(null)
  const demoPayment = env.paymentDemo || env.isDevelopment

  useEffect(() => {
    let cancelled = false

    membershipService
      .fetchPlans()
      .then((data) => {
        if (cancelled) return
        setPlans(data)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(
          err instanceof Error ? err.message : 'Could not load membership plans.',
        )
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [reloadNonce])

  const retry = useCallback(() => {
    setStatus('loading')
    setError(null)
    setReloadNonce((value) => value + 1)
  }, [])

  const closeCheckout = useCallback(() => setCheckoutPlan(null), [])

  return (
    <AppScreen>
      <ScreenHeader title="Membership plans" />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
        <section className="relative overflow-hidden rounded-card bg-gradient-to-br from-maroon to-maroon-deep px-5 py-5 text-white shadow-brand">
          <span className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-white/10" />
          <span className="pointer-events-none absolute -bottom-12 -left-6 size-32 rounded-full bg-white/5" />
          <span className="relative flex size-10 items-center justify-center rounded-full bg-white/15">
            <Crown className="size-5 text-[#f4cf7a]" aria-hidden="true" />
          </span>
          <h2 className="relative mt-3 text-lg font-semibold">Choose your plan</h2>
          <p className="relative mt-1 max-w-xs text-sm leading-relaxed text-white/80">
            Unlock verified contacts, chat and complete profile access.
          </p>
        </section>

        {status === 'loading' ? (
          <div className="mt-4 space-y-3">
            <PlanSkeleton />
            <PlanSkeleton />
            <PlanSkeleton />
          </div>
        ) : status === 'error' ? (
          <div className="mt-4">
            <ErrorState
              title="Could not load membership plans"
              description={error ?? 'Please try again in a moment.'}
              onRetry={retry}
            />
          </div>
        ) : plans.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<Crown className="size-6" aria-hidden="true" />}
              title="No plans available"
              description="Membership plans are not published right now. Please contact the centre."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onSelect={setCheckoutPlan} />
            ))}
          </div>
        )}

        <div className="h-4" />
      </main>

      {checkoutPlan ? (
        <CheckoutSheet plan={checkoutPlan} demo={demoPayment} onClose={closeCheckout} />
      ) : null}
    </AppScreen>
  )
}

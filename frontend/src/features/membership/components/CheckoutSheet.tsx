import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  Lock,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react'

import { Spinner } from '@/components/loading/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatAmount, planMeta, planTitle } from '@/features/membership/format'
import type { MembershipPlanOffer } from '@/features/membership/services/membership.service'
import {
  demoMembershipPaymentService,
  type MembershipPaymentResult,
} from '@/features/membership/services/membership-payment.service'

interface CheckoutSheetProps {
  plan: MembershipPlanOffer
  /** True while the Razorpay endpoints and keys are not connected. */
  demo: boolean
  onClose: () => void
}

type CheckoutStatus = 'idle' | 'processing' | 'success' | 'error'

/**
 * Membership checkout sheet.
 *
 * In demo mode it simulates order creation and verification so the flow can be
 * reviewed. The live Razorpay integration will replace the two service calls
 * with `create-membership-order.php` and `verify-membership-payment.php` plus
 * the Razorpay Checkout script; no key secret belongs in this component.
 */
export function CheckoutSheet({ plan, demo, onClose }: CheckoutSheetProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<CheckoutStatus>('idle')
  const [payment, setPayment] = useState<MembershipPaymentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && status !== 'processing') onClose()
    }
    window.addEventListener('keydown', onKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, status])

  async function handlePay() {
    setStatus('processing')
    setError(null)

    try {
      const order = await demoMembershipPaymentService.createOrder(plan)
      const result = await demoMembershipPaymentService.completePayment(order)
      setPayment(result)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment could not be completed.')
      setStatus('error')
    }
  }

  const title = planTitle(plan.name)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px]"
      onClick={() => {
        if (status !== 'processing') onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-lift md:max-w-xl"
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-line-strong" />

        {status === 'success' && payment ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </span>
            <h2 id="checkout-title" className="mt-4 text-lg font-semibold text-ink">
              {demo ? 'Demo payment completed' : 'Payment successful'}
            </h2>
            {demo ? (
              <Badge tone="warning" className="mt-2">
                Demo — no money was charged
              </Badge>
            ) : null}
            <p className="mt-3 text-sm text-muted">
              {title} · {formatAmount(plan.amount)}
            </p>
            <p className="mt-1 text-2xs text-muted">Payment ID: {payment.paymentId}</p>
            <p className="mx-auto mt-4 max-w-xs text-xs leading-relaxed text-muted">
              {demo
                ? 'This is a UI preview. Connect the Razorpay endpoints to accept live payments and activate memberships automatically.'
                : 'Your membership will be activated once the server verifies this payment.'}
            </p>
            <Button fullWidth size="lg" className="mt-5" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-2xs font-semibold tracking-wide text-muted uppercase">
                  Secure checkout
                </p>
                <h2 id="checkout-title" className="text-lg font-semibold text-ink">
                  Complete your payment
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close checkout"
                onClick={onClose}
                disabled={status === 'processing'}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition hover:bg-cream disabled:opacity-50"
              >
                <X className="size-4.5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-maroon">{title}</p>
                  <p className="mt-0.5 text-xs text-muted">{planMeta(plan)}</p>
                </div>
                <p className="shrink-0 text-xl font-bold tracking-tight text-ink">
                  {formatAmount(plan.amount)}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="text-muted">Total payable</span>
                <span className="font-semibold text-ink">
                  {formatAmount(plan.amount)}
                </span>
              </div>
            </div>

            {user ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-line bg-cream/60 px-3 py-2.5 text-xs">
                <span className="shrink-0 text-muted">Paying as</span>
                <span className="min-w-0 truncate font-semibold text-ink">
                  {user.name}
                  {user.profileId ? ` · ${user.profileId}` : ''}
                </span>
              </div>
            ) : null}

            {demo ? (
              <div className="mt-3 rounded-xl border border-warning/25 bg-warning-soft/60 p-3">
                <div className="flex items-center gap-2">
                  <Badge tone="warning">Demo</Badge>
                  <p className="text-xs font-semibold text-ink">
                    No money will be charged
                  </p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  This simulates the Razorpay checkout. Live payments start after the
                  order and verification endpoints are connected.
                </p>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-line bg-cream/60 p-3">
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">Coming soon</Badge>
                  <p className="text-xs font-semibold text-ink">
                    Online payment is not enabled yet
                  </p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  Online checkout will appear here once Razorpay is connected.
                </p>
              </div>
            )}

            {status === 'error' ? (
              <p
                role="alert"
                className="mt-3 rounded-xl border border-danger/25 bg-danger-soft/60 px-3 py-2.5 text-xs text-danger"
              >
                {error ?? 'Payment could not be completed.'}
              </p>
            ) : null}

            {demo ? (
              <>
                <div className="mt-4">
                  <div className="mb-3 flex items-center justify-center gap-3 text-2xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Smartphone className="size-3.5" aria-hidden="true" /> UPI
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CreditCard className="size-3.5" aria-hidden="true" /> Cards
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Landmark className="size-3.5" aria-hidden="true" /> Net banking
                    </span>
                  </div>
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => void handlePay()}
                    disabled={status === 'processing'}
                    leadingIcon={
                      status === 'processing' ? (
                        <Spinner className="size-4" />
                      ) : (
                        <Lock className="size-4" aria-hidden="true" />
                      )
                    }
                  >
                    {status === 'processing'
                      ? 'Processing payment…'
                      : `Simulate payment · ${formatAmount(plan.amount)}`}
                  </Button>
                </div>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-2xs text-muted">
                  <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
                  Razorpay checkout preview — live payments are verified on the server
                </p>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

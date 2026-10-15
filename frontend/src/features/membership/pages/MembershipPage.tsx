import { Check, Crown, ShieldCheck } from 'lucide-react'

import { Page } from '@/components/ui/Page'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'

const benefits = [
  'View mobile numbers',
  'Unlimited interest requests',
  'Chat with your matches',
  'Highlight your profile',
  'Verified profile badge',
]
const plans = [
  { name: '1 month', price: '₹999' },
  { name: '3 months', price: '₹2,499', popular: true },
  { name: '6 months', price: '₹4,499' },
  { name: '12 months', price: '₹7,999' },
]

export function MembershipPage() {
  const toast = useToast()
  return (
    <Page title="Premium membership" subtitle="Make your search more meaningful.">
      <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-[#fff9e8] to-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Crown className="size-6" />
          </span>
          <div>
            <h2 className="text-lg text-maroon">Premium benefits</h2>
            <p className="text-xs text-muted">
              More ways to connect with the right people
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm text-ink">
              <Check className="size-4 text-amber-700" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-base text-ink">Choose your plan</h2>
        <div className="grid grid-cols-2 gap-3">
          {plans.map((plan) => (
            <button
              key={plan.name}
              className={`relative rounded-2xl border p-4 text-center transition ${plan.popular ? 'border-amber-500 bg-amber-50 shadow-card' : 'border-line bg-white'}`}
            >
              <span className="block text-xs text-muted">{plan.name}</span>
              <span className="mt-1 block text-xl font-bold text-maroon">
                {plan.price}
              </span>
              {plan.popular ? (
                <span className="mt-1 block text-2xs font-semibold text-amber-800">
                  Best value
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </section>
      <Button
        fullWidth
        size="lg"
        onClick={() => toast.info('Membership checkout will be available soon')}
      >
        Continue to payment
      </Button>
      <div className="flex items-center justify-center gap-2 text-xs text-muted">
        <ShieldCheck className="size-4 text-emerald-700" />
        Secure payment · UPI · Cards · Net banking
      </div>
      <p className="text-center text-xs text-muted">
        Plans shown for preview. Payment will be enabled when membership is connected.
      </p>
    </Page>
  )
}

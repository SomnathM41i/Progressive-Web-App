import { useState } from 'react'
import { Check, Crown, ShieldCheck } from 'lucide-react'

import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { useToast } from '@/hooks/useToast'

const benefits = [
  'View mobile numbers',
  'Send unlimited interest requests',
  'Chat with your matches',
  'Get your profile highlighted',
  'See who viewed your profile',
  'Get priority customer support',
]

const plans = [
  { name: '1 month', price: '₹999' },
  { name: '3 months', price: '₹2,499', bestValue: true },
  { name: '6 months', price: '₹4,499' },
  { name: '12 months', price: '₹7,999', fullWidth: true },
]

const paymentMethods = ['UPI', 'VISA', 'Mastercard', 'RuPay', 'Net Banking']

export function MembershipPage() {
  const toast = useToast()
  const [selectedPlan, setSelectedPlan] = useState('3 months')

  return (
    <AppScreen>
      <ScreenHeader title="Premium membership" />

      <main className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-3 pt-3 pb-2">
        <section className="rounded-xl border border-[#eee5d8] bg-white p-3 shadow-soft">
          <h2 className="mb-2 flex items-center justify-center gap-2 text-[13px] font-semibold text-maroon"><Crown className="size-4 fill-[#d89c21] text-[#b97713]" />Premium benefits</h2>
          <ul className="space-y-1.5">{benefits.map((benefit) => <li key={benefit} className="flex items-center gap-1.5 text-[10px] leading-tight text-ink"><Check className="size-3.5 shrink-0 text-[#9a641c]" strokeWidth={2.4} />{benefit}</li>)}</ul>
        </section>

        <section aria-label="Membership plans" className="grid grid-cols-3 gap-2">
          {plans.map((plan) => <button key={plan.name} type="button" aria-pressed={selectedPlan === plan.name} onClick={() => setSelectedPlan(plan.name)} className={`relative flex min-h-[4.5rem] flex-col items-center justify-center rounded-lg border px-1.5 py-2 text-center transition ${plan.fullWidth ? 'col-span-3 min-h-[3.8rem]' : ''} ${selectedPlan === plan.name ? 'border-[#d6a145] bg-[#fff6e5] shadow-soft' : 'border-[#e9e2de] bg-white'}`}>
            <span className="text-[10px] font-medium text-ink">{plan.name}</span>
            <span className={`mt-0.5 text-[15px] font-bold ${selectedPlan === plan.name ? 'text-maroon' : 'text-ink'}`}>{plan.price}</span>
            {plan.bestValue ? <span className="mt-0.5 text-[8px] text-[#9a641c]">Best value</span> : null}
          </button>)}
        </section>
      </main>

      <footer className="shrink-0 space-y-2 border-t border-line bg-white px-3 pt-2.5 pb-2">
        <button type="button" onClick={() => toast.info('Membership checkout will be available soon')} className="h-10 w-full rounded-lg bg-maroon text-xs font-semibold text-white shadow-brand transition hover:bg-maroon-dark">Continue with {selectedPlan} plan</button>
        <div className="text-center">
          <p className="mb-1 flex items-center justify-center gap-1 text-[10px] font-medium text-maroon"><ShieldCheck className="size-3.5 text-emerald-700" />Secure payment methods</p>
          <ul className="flex items-center justify-center gap-1.5">{paymentMethods.map((method) => <li key={method} className="flex h-6 min-w-10 items-center justify-center rounded border border-[#eee9e5] bg-white px-1 text-[8px] font-bold text-[#333]">{method}</li>)}</ul>
        </div>
      </footer>
    </AppScreen>
  )
}

import type { MembershipPlanOffer } from '@/features/membership/services/membership.service'

/** Shared display formatting for membership plans. */

/** `2850` → `₹2,850`. */
export function formatAmount(amount: number): string {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`
}

/** `180` → `6 months`, `365` → `1 year`, `2000` → `5.5 years`. */
export function durationLabel(days: number): string | null {
  if (days <= 0) return null
  if (days % 365 === 0) {
    const years = days / 365
    return `${years} ${years === 1 ? 'year' : 'years'}`
  }
  if (days % 30 === 0) {
    const months = days / 30
    return `${months} ${months === 1 ? 'month' : 'months'}`
  }
  if (days > 365) {
    return `${Math.round((days / 365) * 10) / 10} years`
  }
  return `${days} days`
}

/** The API writes plans as `(6)Months`, `Diamond-Vip`, `Marry-Till`. */
export function planTitle(name: string): string {
  return name
    .replace(/\(\s*(\d+)\s*\)\s*months?/i, '$1 months')
    .replace(/-/g, ' ')
    .replace(/\bvip\b/gi, 'VIP')
}

/** `6 months · 100 verified contacts` (duration omitted when already in the name). */
export function planMeta(plan: MembershipPlanOffer): string {
  const title = planTitle(plan.name)
  const duration = durationLabel(plan.durationDays)
  const showDuration =
    duration !== null && !title.toLowerCase().includes(duration.toLowerCase())
  return [
    showDuration ? duration : null,
    plan.contacts > 0 ? `${plan.contacts} verified contacts` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

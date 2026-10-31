import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

/**
 * Membership plans offered by the centre (`getMembershipPlanDetails.php`).
 *
 * The endpoint is a public GET and answers with `{ status, message, data }`
 * where `data` is the list of plans. Every field arrives as a string, so the
 * mapper converts the numeric ones and keeps the feature list as-is.
 */
export interface MembershipPlanOffer {
  id: number
  name: string
  /** One-time price in rupees. */
  amount: number
  /** Validity in days (180, 365, 2000…). */
  durationDays: number
  /** Verified contacts included with the plan. */
  contacts: number
  /** Feature lines shown on the plan card. */
  features: string[]
}

interface MembershipPlansResponse {
  status?: string
  message?: string
  data?: unknown
}

function isSuccess(status: unknown): boolean {
  if (typeof status === 'string') {
    const value = status.toLowerCase()
    return value === 'success' || value === 'true'
  }
  return status === 1 || status === true
}

function asText(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed && trimmed.toUpperCase() !== 'NULL' ? trimmed : null
  }
  if (typeof value === 'number') return String(value)
  return null
}

function asNumber(value: unknown): number | null {
  const text = asText(value)
  if (text === null) return null
  const parsed = Number(text)
  return Number.isFinite(parsed) ? parsed : null
}

/** Extracts the plan array from `data` or a nested `plans` key. */
function planRows(data: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(data)) {
    return data.filter(
      (row): row is Record<string, unknown> => typeof row === 'object' && row !== null,
    )
  }
  if (typeof data === 'object' && data !== null) {
    const plans = (data as Record<string, unknown>).plans
    if (Array.isArray(plans)) {
      return plans.filter(
        (row): row is Record<string, unknown> =>
          typeof row === 'object' && row !== null,
      )
    }
  }
  return []
}

function mapPlan(row: Record<string, unknown>): MembershipPlanOffer | null {
  const id = asNumber(row.planid)
  const name = asText(row.plandisplayname)
  const amount = asNumber(row.planamount)
  if (id === null || name === null || amount === null) return null

  const rawFeatures = Array.isArray(row.descriptions) ? row.descriptions : []
  const features = rawFeatures
    .map((item) => asText(item))
    .filter((item): item is string => item !== null)
    // Chat is hidden in the app, so its plan benefits are not advertised.
    .filter((item) => !/\bchat\b/i.test(item))

  return {
    id,
    name,
    amount,
    durationDays: asNumber(row.planduration) ?? 0,
    contacts: asNumber(row.plannoofcontacts) ?? 0,
    features,
  }
}

export interface MembershipService {
  fetchPlans: () => Promise<MembershipPlanOffer[]>
}

export const membershipService: MembershipService = {
  async fetchPlans() {
    const { data } = await api.get<MembershipPlansResponse>(
      '/getMembershipPlanDetails.php',
    )

    if (!data || !isSuccess(data.status)) {
      throw new ApiError({
        message: data?.message ?? 'Could not load membership plans.',
      })
    }

    return planRows(data.data)
      .map((row) => mapPlan(row))
      .filter((plan): plan is MembershipPlanOffer => plan !== null)
  },
}

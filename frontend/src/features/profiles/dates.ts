/**
 * Date and status helpers for read-only profile data.
 *
 * The legacy API returns dates as free-form strings (`YYYY-MM-DD`, `DD/MM/YYYY`,
 * or similar) with no documented format, so every parse here is defensive: an
 * unparseable value yields `null` and the UI hides or degrades the field rather
 * than rendering "Invalid Date".
 */

/** Parses a loosely-formatted date string, returning a Date or null. */
export function parseApiDate(value: string | null | undefined): Date | null {
  const text = value?.trim()
  if (!text) return null

  // Prefer explicit DD/MM/YYYY handling before the lenient Date constructor,
  // which would otherwise read `03/04/2026` as March 4 in some engines.
  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text)
  if (dmy) {
    const day = Number(dmy[1])
    const month = Number(dmy[2])
    const year = Number(dmy[3])
    const parsed = new Date(year, month - 1, day)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Formats a loosely-formatted date as `D Mon YYYY`, or null when unparseable. */
export function formatApiDate(value: string | null | undefined): string | null {
  const date = parseApiDate(value)
  if (!date) return null
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export type MembershipStatusTone = 'active' | 'expired' | 'none' | 'unknown'

/**
 * Derives a membership status from its expiry date.
 *
 * Never assumes "Active": a missing or unparseable expiry date is reported as
 * `unknown`, not `active`, so the UI cannot claim a live plan it cannot verify.
 */
export function membershipStatus(expiry: string | null | undefined): {
  tone: MembershipStatusTone
  label: string
} {
  if (!expiry?.trim()) return { tone: 'unknown', label: 'Status unavailable' }

  const date = parseApiDate(expiry)
  if (!date) return { tone: 'unknown', label: 'Status unavailable' }

  return date.getTime() >= Date.now()
    ? { tone: 'active', label: 'Active' }
    : { tone: 'expired', label: 'Expired' }
}

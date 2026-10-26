import type {
  RegistrationApiRecord,
  RegistrationEnvelope,
} from '@/features/registration/types'

const DATA_KEYS = ['data', 'result', 'profile', 'details', 'record'] as const

export function pickRegistrationValue(
  record: RegistrationApiRecord,
  keys: readonly string[],
): unknown {
  const wanted = keys.map((key) => key.toLowerCase())
  for (const [key, value] of Object.entries(record)) {
    if (wanted.includes(key.toLowerCase()) && value !== null && value !== '') {
      return value
    }
  }
  return undefined
}

export function readRegistrationText(
  record: RegistrationApiRecord,
  keys: readonly string[],
): string | null {
  const value = pickRegistrationValue(record, keys)
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    const parts = value
      .map((part) => (typeof part === 'string' ? part.trim() : String(part)))
      .filter(Boolean)
    return parts.length ? parts.join(', ') : null
  }
  return null
}

export function readRegistrationList(
  record: RegistrationApiRecord,
  keys: readonly string[],
): string[] {
  const value = pickRegistrationValue(record, keys)
  if (Array.isArray(value)) {
    return value.map((part) => String(part).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  }
  return []
}

export function extractRegistrationRecord(
  body: RegistrationEnvelope<unknown>,
): RegistrationApiRecord {
  const nested = pickRegistrationValue(body as RegistrationApiRecord, [...DATA_KEYS])
  if (typeof nested === 'object' && nested !== null && !Array.isArray(nested)) {
    return nested as RegistrationApiRecord
  }
  if (Array.isArray(nested) && nested.length && typeof nested[0] === 'object') {
    return nested[0] as RegistrationApiRecord
  }
  return body as RegistrationApiRecord
}

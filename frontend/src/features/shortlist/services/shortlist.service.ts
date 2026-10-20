import type {
  ShortlistActionResponse,
  ShortlistApiRow,
  ShortlistEntry,
  ShortlistListApiResponse,
  ShortlistListResult,
} from '@/features/shortlist/types'
import { resolveMediaUrl } from '@/features/profiles/media'
import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

/**
 * Keys the API family uses to carry the row array in a list response.
 * The first one that holds an array wins — the exact key per endpoint is not
 * documented in the collection, so this stays tolerant instead of guessing one.
 */
const LIST_KEYS = [
  'results',
  'data',
  'shortlist',
  'shortlists',
  'list',
  'records',
  'items',
] as const

/**
 * Interprets the `status` field.
 *
 * This API answers HTTP 200 for failures too, so `status` decides. The exact
 * positive values used per endpoint are unconfirmed, so anything that is not a
 * recognised failure is treated as success; failures (`error`, `failed`, `0`,
 * `false`) still raise with the server message.
 */
function isFailure(status: unknown): boolean {
  if (status === 0 || status === false) return true
  if (typeof status === 'string') {
    const normalised = status.trim().toLowerCase()
    return (
      normalised === 'error' ||
      normalised === 'failed' ||
      normalised === 'fail' ||
      normalised === '0'
    )
  }
  return false
}

/** Rejects non-JSON bodies (proxy pages, bot challenges) before they are read. */
function ensureJsonBody(data: unknown): void {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ApiError({
      message: 'The server returned an unexpected response. Please try again.',
    })
  }
}

function extractRows(payload: ShortlistListApiResponse): ShortlistApiRow[] {
  for (const key of LIST_KEYS) {
    const value = payload[key]
    if (Array.isArray(value)) return value as ShortlistApiRow[]
    // One nested level covers envelopes such as `{ data: { list: [...] } }`.
    if (typeof value === 'object' && value !== null) {
      for (const inner of Object.values(value)) {
        if (Array.isArray(inner)) return inner as ShortlistApiRow[]
      }
    }
  }
  return []
}

function firstString(
  row: ShortlistApiRow,
  keys: Array<keyof ShortlistApiRow>,
): string | undefined {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

/**
 * Name across the two list endpoints.
 *
 * Only `Name` was confirmed on the mutual-matches family; other lists have
 * returned rows where it is absent, so first try the direct variants, then
 * compose a first + last pair, before the caller falls back to "Member".
 */
function readName(row: ShortlistApiRow): string | undefined {
  const direct = firstString(row, [
    'Name',
    'name',
    'FullName',
    'Full_Name',
    'Fullname',
    'ProfileName',
  ])
  if (direct) return direct

  const first = firstString(row, ['FirstName', 'Firstname', 'First_Name'])
  const last = firstString(row, ['LastName', 'Lastname', 'Last_Name'])
  if (first || last) return [first, last].filter(Boolean).join(' ')

  return undefined
}

function mapRow(row: ShortlistApiRow): ShortlistEntry | null {
  if (!row) return null

  // Some rows carry the id as a number rather than a string; coerce so those
  // rows are not silently dropped.
  const id = row.MatriID ?? row.ProfileID
  const idText =
    typeof id === 'string'
      ? id.trim()
      : typeof id === 'number' && Number.isFinite(id)
        ? String(id)
        : ''
  if (!idText) return null

  const location = [row.District, row.State].filter(Boolean).join(', ')
  const gender = row.Gender?.toLowerCase()
  const savedAt = firstString(row, [
    'ShortlistDate',
    'shortlist_date',
    'created_at',
    'saved_at',
  ])

  return {
    id: idText,
    name: readName(row) || 'Member',
    age: Number(row.Age) || 0,
    location: location || 'Not specified',
    occupation: row.Occupation || undefined,
    gender: gender === 'female' ? 'Bride' : gender === 'male' ? 'Groom' : undefined,
    education: row.Education || undefined,
    height: row.Height || undefined,
    caste: row.Caste || undefined,
    maritalStatus: row.Maritalstatus || undefined,
    photoUrl: resolveMediaUrl(row.photo_url ?? row.Photo1),
    isVerified: row.Status === 'Paid',
    isNew: false,
    savedAt,
  }
}

async function fetchList(path: string, matriId: string): Promise<ShortlistListResult> {
  const body = new URLSearchParams({ MatriID: matriId })
  const { data } = await api.post<ShortlistListApiResponse>(path, body)

  ensureJsonBody(data)

  if (isFailure(data.status)) {
    throw new ApiError({ message: data.message || 'Failed to load the shortlist' })
  }

  const entries = extractRows(data)
    .map(mapRow)
    .filter((entry): entry is ShortlistEntry => entry !== null)

  return { entries }
}

async function runAction(
  path: string,
  fields: Record<string, string>,
  fallbackMessage: string,
): Promise<void> {
  const body = new URLSearchParams(fields)
  const { data } = await api.post<ShortlistActionResponse>(path, body)

  ensureJsonBody(data)

  if (isFailure(data.status)) {
    throw new ApiError({ message: data.message || fallbackMessage })
  }
}

export interface ShortlistService {
  /** Profiles the member has shortlisted. */
  fetchMy: (matriId: string) => Promise<ShortlistListResult>
  /** Members who shortlisted the member's profile. */
  fetchWhoShortlistedMe: (matriId: string) => Promise<ShortlistListResult>
  /** Member shortlists `profileId`. */
  add: (matriId: string, profileId: string) => Promise<void>
  /** Member removes `profileId` from the shortlist. */
  remove: (matriId: string, profileId: string) => Promise<void>
}

const shortlistServiceImpl: ShortlistService = {
  fetchMy(matriId) {
    return fetchList('/get-list-MyShortlistedProfiles.php', matriId)
  },

  fetchWhoShortlistedMe(matriId) {
    return fetchList('/get-list-WhoShortlistedMyProfile.php', matriId)
  },

  add(matriId, profileId) {
    return runAction(
      '/shortlist-user-profile.php',
      { MatriID: matriId, ProfileID: profileId },
      'Could not add this profile to your shortlist. Please try again.',
    )
  },

  remove(matriId, profileId) {
    return runAction(
      '/remove-user-from-shortlist.php',
      { MatriID: matriId, ProfileID: profileId },
      'Could not remove this profile from your shortlist. Please try again.',
    )
  },
}

export const shortlistService: ShortlistService = shortlistServiceImpl

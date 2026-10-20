import type {
  InterestActionResponse,
  InterestApiRow,
  InterestEntry,
  InterestListApiResponse,
  InterestListResult,
} from '@/features/interests/types'
import { resolveMediaUrl } from '@/features/profiles/media'
import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

/**
 * Keys the API family uses to carry the row array in a list response.
 * The first one that holds an array wins — the exact key per endpoint is not
 * documented in the collection, so this stays tolerant instead of guessing one.
 */
const LIST_KEYS = ['results', 'data', 'interests', 'list', 'records', 'items'] as const

/** Rows at or above this count with no pagination meta mean a next page exists. */
const IMPLICIT_PAGE_SIZE = 10

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

function extractRows(payload: InterestListApiResponse): InterestApiRow[] {
  for (const key of LIST_KEYS) {
    const value = payload[key]
    if (Array.isArray(value)) return value as InterestApiRow[]
    // One nested level covers envelopes such as `{ data: { list: [...] } }`.
    if (typeof value === 'object' && value !== null) {
      for (const inner of Object.values(value)) {
        if (Array.isArray(inner)) return inner as InterestApiRow[]
      }
    }
  }
  return []
}

function firstString(
  row: InterestApiRow,
  keys: Array<keyof InterestApiRow>,
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
 * Only `Name` was confirmed on the mutual-matches family; the pending list has
 * returned rows where it is absent, so first try the direct variants, then
 * compose a first + last pair, before the caller falls back to "Member".
 */
function readName(row: InterestApiRow): string | undefined {
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

function mapRow(row: InterestApiRow): InterestEntry | null {
  if (!row) return null

  // Some rows carry the id as a number rather than a string; coerce so those
  // rows are not silently dropped.
  const rawId = row.MatriID as unknown
  const id =
    typeof rawId === 'string'
      ? rawId.trim()
      : typeof rawId === 'number' && Number.isFinite(rawId)
        ? String(rawId)
        : ''
  if (!id) return null

  const location = [row.District, row.State].filter(Boolean).join(', ')
  const gender = row.Gender?.toLowerCase()
  const sentAt = firstString(row, [
    'SentDate',
    'InterestDate',
    'interest_date',
    'created_at',
    'sent_at',
  ])

  return {
    id,
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
    sentAt,
  }
}

function resolveHasMore(
  body: InterestListApiResponse,
  page: number,
  rowCount: number,
): boolean {
  const pagination = body.pagination
  if (typeof pagination?.has_next === 'boolean') return pagination.has_next
  if (typeof pagination?.total_pages === 'number') return pagination.total_pages > page
  if (typeof body.total_pages === 'number') return body.total_pages > page
  if (typeof body.has_next === 'boolean') return body.has_next
  // No meta: a page shorter than the implicit size is the last page. A full
  // page means one more *may* exist — the caller stops when a page comes back
  // empty, so a permanently-full response cannot loop forever.
  return rowCount >= IMPLICIT_PAGE_SIZE
}

async function fetchList(
  path: string,
  matriId: string,
  page: number,
): Promise<InterestListResult> {
  const body = new URLSearchParams({ MatriID: matriId, page: String(page) })
  const { data } = await api.post<InterestListApiResponse>(path, body)

  ensureJsonBody(data)

  if (isFailure(data.status)) {
    throw new ApiError({ message: data.message || 'Failed to load interests' })
  }

  const entries = extractRows(data)
    .map(mapRow)
    .filter((entry): entry is InterestEntry => entry !== null)

  return { entries, page, hasMore: resolveHasMore(data, page, entries.length) }
}

async function runAction(
  path: string,
  fields: Record<string, string>,
  fallbackMessage: string,
): Promise<void> {
  const body = new URLSearchParams(fields)
  const { data } = await api.post<InterestActionResponse>(path, body)

  ensureJsonBody(data)

  if (isFailure(data.status)) {
    throw new ApiError({ message: data.message || fallbackMessage })
  }
}

export interface InterestsService {
  /** Interests others sent to the member (accept / decline act on these). */
  fetchReceived: (matriId: string, page?: number) => Promise<InterestListResult>
  /** Interests the member sent that are still pending. */
  fetchSent: (matriId: string, page?: number) => Promise<InterestListResult>
  /** Member sends an interest to `receiverId`. */
  sendInterest: (matriId: string, receiverId: string) => Promise<void>
  /** Member accepts an interest from `senderId`. */
  acceptInterest: (matriId: string, senderId: string) => Promise<void>
  /** Member declines an interest from `senderId`. */
  declineInterest: (matriId: string, senderId: string) => Promise<void>
  /** Member marks `receiverId` as not interested. */
  markNotInterested: (matriId: string, receiverId: string) => Promise<void>
}

const interestsServiceImpl: InterestsService = {
  fetchReceived(matriId, page = 1) {
    return fetchList('/getMyReceivedInterestList.php', matriId, page)
  },

  fetchSent(matriId, page = 1) {
    return fetchList('/getMyPendingInterestList.php', matriId, page)
  },

  sendInterest(matriId, receiverId) {
    return runAction(
      '/send-interest.php',
      { MatriID: matriId, ReceiverID: receiverId },
      'Could not send the interest. Please try again.',
    )
  },

  acceptInterest(matriId, senderId) {
    return runAction(
      '/accept-interest.php',
      { MatriID: matriId, SenderID: senderId },
      'Could not accept the interest. Please try again.',
    )
  },

  declineInterest(matriId, senderId) {
    return runAction(
      '/decline-Interest.php',
      { MatriID: matriId, SenderID: senderId },
      'Could not decline the interest. Please try again.',
    )
  },

  markNotInterested(matriId, receiverId) {
    return runAction(
      '/mark-not-interested.php',
      { MatriID: matriId, ReceiverID: receiverId },
      'Could not update this interest. Please try again.',
    )
  },
}

export const interestsService: InterestsService = interestsServiceImpl

import type { ProfilePreview } from '@/features/profiles/types'
import { resolveMediaUrl } from '@/features/profiles/media'
import type {
  MutualMatchApiResponse,
  MutualMatchResult,
} from '@/features/matches/types'
import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

/**
 * Interprets the `status` field.
 *
 * This API answers HTTP 200 for failures too, so `status` decides. The exact
 * positive value is unconfirmed, so anything that is not a recognised failure
 * is treated as success; failures (`error`, `failed`, `0`, `false`) still raise
 * with the server message.
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

function mapToProfilePreview(result: MutualMatchResult): ProfilePreview | null {
  const id = typeof result.MatriID === 'string' ? result.MatriID.trim() : ''
  if (!id) return null

  const location = [result.District, result.State].filter(Boolean).join(', ')
  const gender = result.Gender?.toLowerCase() === 'female' ? 'Bride' : 'Groom'

  return {
    id,
    name: result.Name?.trim() || 'Member',
    age: Number(result.Age) || 0,
    location: location || 'Not specified',
    occupation: result.Occupation || undefined,
    gender,
    education: result.Education || undefined,
    height: result.Height || undefined,
    caste: result.Caste || undefined,
    maritalStatus: result.Maritalstatus || undefined,
    photoUrl: resolveMediaUrl(result.photo_url),
    isVerified: result.Status === 'Paid',
    isNew: false,
  }
}

export interface MatchesService {
  fetchMutualMatches: (
    matriId: string,
    page?: number,
    limit?: number,
  ) => Promise<{ profiles: ProfilePreview[]; pagination?: MutualMatchApiResponse['pagination'] }>
}

const matchesServiceImpl: MatchesService = {
  async fetchMutualMatches(
    matriId: string,
    page = 1,
    limit = 12,
  ): Promise<{ profiles: ProfilePreview[]; pagination?: MutualMatchApiResponse['pagination'] }> {
    const body = new URLSearchParams({ MatriID: matriId, page: String(page), limit: String(limit) })
    const { data } = await api.post<MutualMatchApiResponse>(
      '/get-mutual-matches.php',
      body,
    )

    ensureJsonBody(data)

    if (isFailure(data.status)) {
      throw new ApiError({
        message: data.message || 'Failed to fetch mutual matches',
      })
    }

    const rows = Array.isArray(data.results) ? data.results : []

    const profiles = rows
      .map(mapToProfilePreview)
      .filter((profile): profile is ProfilePreview => profile !== null)

    return { profiles, pagination: data.pagination }
  },
}

export const matchesService: MatchesService = matchesServiceImpl

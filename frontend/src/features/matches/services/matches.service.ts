import type { ProfilePreview } from '@/features/profiles/types'
import type {
  MutualMatchApiResponse,
  MutualMatchResult,
} from '@/features/matches/types'
import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

const BASE_PHOTO_URL = 'https://shivrajmaratha.com'

function buildPhotoUrl(photoUrl?: string): string | null {
  if (!photoUrl) return null
  if (photoUrl.startsWith('http')) return photoUrl
  if (photoUrl.startsWith('/')) return `${BASE_PHOTO_URL}${photoUrl}`
  return `${BASE_PHOTO_URL}/${photoUrl}`
}

function mapToProfilePreview(result: MutualMatchResult): ProfilePreview {
  const location = [result.District, result.State].filter(Boolean).join(', ')
  const gender = result.Gender?.toLowerCase() === 'female' ? 'Bride' : 'Groom'

  return {
    id: result.MatriID,
    name: result.Name,
    age: Number(result.Age) || 0,
    location: location || 'Not specified',
    occupation: result.Occupation || undefined,
    gender,
    education: result.Education || undefined,
    height: result.Height || undefined,
    caste: result.Caste || undefined,
    maritalStatus: result.Maritalstatus || undefined,
    photoUrl: buildPhotoUrl(result.photo_url),
    isVerified: result.Status === 'Paid',
    isNew: false,
  }
}

export interface MatchesService {
  fetchMutualMatches: (matriId: string) => Promise<ProfilePreview[]>
}

const matchesServiceImpl: MatchesService = {
  async fetchMutualMatches(matriId: string): Promise<ProfilePreview[]> {
    const body = new URLSearchParams({ MatriID: matriId })
    const { data } = await api.post<MutualMatchApiResponse>(
      '/get-mutual-matches.php',
      body,
    )

    if (data.status !== 'success') {
      throw new ApiError({
        message: data.message || 'Failed to fetch mutual matches',
      })
    }

    return (data.results || []).map(mapToProfilePreview)
  },
}

export const matchesService: MatchesService = matchesServiceImpl

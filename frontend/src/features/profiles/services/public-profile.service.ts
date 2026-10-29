import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'
import type { ProfilePreview } from '@/features/profiles/types'

interface PublicProfilesResponse {
  status?: string
  message?: string
  data?: {
    profiles?: Array<Record<string, unknown>>
    pagination?: {
      current_page?: number
      per_page?: number
      total_profiles?: number
      total_pages?: number
    }
  }
}

function isSuccess(status: unknown): boolean {
  if (typeof status === 'string') {
    const s = status.toLowerCase()
    return s === 'success' || s === 'true'
  }
  return status === 1 || status === true
}

function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return null
}

function pick(record: Record<string, unknown>, keys: string[]): unknown {
  const wanted = keys.map((key) => key.toLowerCase())
  for (const [key, value] of Object.entries(record)) {
    if (wanted.includes(key.toLowerCase()) && value !== null && value !== '') {
      return value
    }
  }
  return undefined
}

function toAge(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const match = value.match(/\d+/)
    if (match) return Number(match[0])
  }
  return 0
}

function mapProfile(row: Record<string, unknown>): ProfilePreview | null {
  const id = asText(pick(row, ['MatriID', 'matri_id', 'profile_id', 'id']))
  if (!id) return null

  const name =
    asText(pick(row, ['display_name', 'DisplayName', 'Name', 'FullName'])) ?? id
  const age = toAge(pick(row, ['Age', 'age']))
  const location =
    asText(pick(row, ['city', 'City', 'dist', 'District', 'taluka', 'Taluka'])) ?? ''
  const occupation = asText(pick(row, ['occupation', 'Occupation']))
  const photo = asText(pick(row, ['photo_url', 'photoUrl', 'Photo1', 'photo']))
  const gender = asText(pick(row, ['Gender', 'gender']))

  return {
    id,
    name,
    age,
    location,
    occupation: occupation ?? undefined,
    gender: gender === 'Male' ? 'Groom' : gender === 'Female' ? 'Bride' : undefined,
    photoUrl: photo ?? null,
  }
}

export type PublicProfileType = 'unmarried' | 'remarriage' | 'nri'

const ENDPOINTS: Record<PublicProfileType, string> = {
  unmarried: '/get_unmarried_profiles.php',
  remarriage: '/get_remarriage_profiles.php',
  nri: '/get_nri_profiles.php',
}

export const publicProfileService = {
  async list(type: PublicProfileType, params: { gender?: 'Male' | 'Female'; page?: number; limit?: number } = {}) {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
    }
    if (params.gender) query.gender = params.gender

    const { data } = await api.get<PublicProfilesResponse>(ENDPOINTS[type], { params: query })
    if (!data || !isSuccess(data.status)) {
      throw new ApiError({ message: data?.message ?? 'Could not load profiles.' })
    }

    const profiles = Array.isArray(data.data?.profiles) ? data.data?.profiles : []
    return {
      profiles: profiles
        .map((row) => mapProfile(row))
        .filter((profile): profile is ProfilePreview => profile !== null),
      pagination: data.data?.pagination,
    }
  },
}

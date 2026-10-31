import { withPhotoSize } from '@/features/profiles/services/public-profile.service'
import type { ProfilePreview } from '@/features/profiles/types'
import type {
  SearchApiResponse,
  SearchApiRow,
  SearchFilters,
  SearchResult,
} from '@/features/search/types'
import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

/** The API fills location gaps with this placeholder instead of leaving them blank. */
function place(value: string | undefined): string | null {
  const text = value?.trim()
  return text && text.toLowerCase() !== 'not set' ? text : null
}

function mapRow(row: SearchApiRow): ProfilePreview | null {
  const id = String(row.MatriID ?? '').trim()
  if (!id) return null

  const location = [place(row.City) ?? place(row.Taluka), place(row.District)]
    .filter(Boolean)
    .join(', ')

  return {
    id,
    name: row.Name?.trim() || id,
    age: Number(row.Age) || 0,
    location: location || 'Not specified',
    occupation: row.Occupation?.trim() || undefined,
    gender: row.Gender === 'Female' ? 'Bride' : row.Gender === 'Male' ? 'Groom' : undefined,
    education: row.Education?.trim() || undefined,
    height: row.Height?.trim() || undefined,
    caste: row.Caste?.trim() || undefined,
    maritalStatus: row.Maritalstatus?.trim() || undefined,
    // A blurred photo is one this member may not see, so it stays hidden.
    photoUrl: row.is_blurred ? null : withPhotoSize(row.photo_url, 500),
  }
}

function buildBody(memberId: string, filters: SearchFilters, page: number): URLSearchParams {
  const fields: Record<string, string> = {
    logged_user: memberId,
    gender: filters.gender,
    StartAge: filters.startAge,
    EndAge: filters.endAge,
    StartHeight: filters.startHeight,
    EndHeight: filters.endHeight,
    with_photo: filters.photoOnly ? 'Yes' : '',
    page: String(page),
  }
  const lists: Record<string, string[]> = {
    religion: filters.religion,
    caste: filters.caste,
    district: filters.district,
    taluka: filters.taluka,
    edu: filters.education,
    occu: filters.occupation,
    income: filters.income,
    looking: filters.maritalStatus,
    workinglocation: filters.workingLocation.split(',').map((place) => place.trim()),
  }

  const body = new URLSearchParams(Object.entries(fields).filter(([, value]) => value !== ''))
  for (const [key, values] of Object.entries(lists)) {
    for (const value of values) {
      if (value) body.append(`${key}[]`, value)
    }
  }
  return body
}

export interface SearchService {
  search: (memberId: string, filters: SearchFilters, page?: number) => Promise<SearchResult>
}

export const searchService: SearchService = {
  async search(memberId, filters, page = 1) {
    const { data } = await api.post<SearchApiResponse>(
      '/advance-search.php',
      buildBody(memberId, filters, page),
    )

    if (typeof data !== 'object' || data === null || !Array.isArray(data.results)) {
      throw new ApiError({
        message: data?.message || 'The search could not be completed. Please try again.',
      })
    }

    const profiles = data.results
      .map(mapRow)
      .filter((profile): profile is ProfilePreview => profile !== null)

    return {
      profiles,
      page: Number(data.pagination?.current_page) || page,
      totalResults: Number(data.pagination?.total_results) || 0,
      hasNext: profiles.length > 0 && data.pagination?.has_next === true,
    }
  },
}

import type { ProfilePreview } from '@/features/profiles/types'

/**
 * Advanced search contract (`advance-search.php`), confirmed live.
 *
 * Form POST; only `logged_user` is required. Blank filters must be omitted
 * because a blank is not always read as "Any". List filters accept several
 * values as repeated `key[]` fields and match any of them; a comma-joined value
 * matches nothing. Values must come from the master lists: `income` takes the
 * numeric `value`, `StartHeight` / `EndHeight` take the height codes 1–37 (no
 * master endpoint exists), and `with_photo=Yes` limits results to profiles with
 * a photo.
 *
 * "No results" is answered as `status: "error"` with an empty `results` array,
 * so an array in the response means the search itself worked. Real errors carry
 * no `results` key. Pages hold 24 rows.
 */
export interface SearchFilters {
  gender: string
  startAge: string
  endAge: string
  startHeight: string
  endHeight: string
  religion: string[]
  caste: string[]
  district: string[]
  taluka: string[]
  education: string[]
  occupation: string[]
  income: string[]
  maritalStatus: string[]
  /** Free text; several places are separated by commas. */
  workingLocation: string
  photoOnly: boolean
}

export interface SearchApiRow {
  MatriID?: string | number
  Name?: string
  Gender?: string
  Age?: string | number
  Height?: string
  Education?: string
  Occupation?: string
  Caste?: string
  City?: string
  Taluka?: string
  District?: string
  Maritalstatus?: string
  photo_url?: string
  is_blurred?: boolean
}

export interface SearchApiResponse {
  status?: unknown
  message?: string
  pagination?: {
    current_page?: number
    total_pages?: number
    total_results?: number
    has_next?: boolean
  }
  results?: SearchApiRow[]
}

export interface SearchResult {
  profiles: ProfilePreview[]
  page: number
  totalResults: number
  hasNext: boolean
}

import type { ProfilePreview } from '@/features/profiles/types'

/**
 * Shortlist feature contracts.
 *
 * Request shapes come from the "SVR Matrimony API Collection" Postman
 * collection (Features Master folder). Every shortlist endpoint is a form POST
 * carrying `MatriID`, plus `ProfileID` for the two actions. The list endpoints
 * define no `page` parameter, so shortlist fetching is single-shot:
 *
 * | Endpoint | Extra fields |
 * |---|---|
 * | `get-list-MyShortlistedProfiles.php`   | —            |
 * | `get-list-WhoShortlistedMyProfile.php` | —            |
 * | `shortlist-user-profile.php`           | `ProfileID`  |
 * | `remove-user-from-shortlist.php`       | `ProfileID`  |
 *
 * The collection ships no response samples, so the envelope types below follow
 * the conventions confirmed for this API family: HTTP 200 even on failure,
 * success decided by the JSON `status` field rather than the status code, and
 * rows under a collection key such as `results` or `data`. Row field names
 * mirror the ones observed live on `get-mutual-matches.php`.
 */

/** Pagination block if a list endpoint reports it (not defined in the collection). */
export interface ShortlistPagination {
  current_page?: number
  total_pages?: number
  has_next?: boolean
}

/** One profile row as returned by the shortlist list endpoints. */
export interface ShortlistApiRow {
  /** Profile id in the rows, same convention as the mutual-matches family. */
  MatriID: string
  /** Some APIs address the shortlisted profile as `ProfileID` in list rows. */
  ProfileID?: string
  Name?: string
  /** The interests family has been seen without `Name`; these are the fallbacks. */
  name?: string
  FullName?: string
  Full_Name?: string
  Fullname?: string
  ProfileName?: string
  FirstName?: string
  Firstname?: string
  First_Name?: string
  LastName?: string
  Lastname?: string
  Last_Name?: string
  Gender?: string
  Age?: string | number
  Height?: string
  Education?: string
  Occupation?: string
  Caste?: string
  Maritalstatus?: string
  Country?: string
  State?: string
  District?: string
  City?: string
  Photo1?: string
  photo_url?: string
  Status?: string
  /** When the shortlist entry was created, if the API reports it. */
  ShortlistDate?: string
  shortlist_date?: string
  created_at?: string
  saved_at?: string
}

/**
 * Envelope of the two list endpoints.
 *
 * The row array is read from whichever of these keys the API actually uses —
 * see `extractRows` in the service. Only `status` and `message` are relied on
 * for control flow.
 */
export interface ShortlistListApiResponse {
  status?: unknown
  message?: string
  pagination?: ShortlistPagination
  results?: unknown
  data?: unknown
  shortlist?: unknown
  shortlists?: unknown
  list?: unknown
  records?: unknown
  items?: unknown
  total_pages?: number
  has_next?: boolean
}

/** Envelope of the shortlist / remove actions. */
export interface ShortlistActionResponse {
  status?: unknown
  message?: string
}

/** A profile shown in either shortlist view. */
export interface ShortlistEntry extends ProfilePreview {
  /** When this profile was shortlisted, if the API reports it. */
  savedAt?: string
}

export type ShortlistTab = 'mine' | 'theirs'

export interface ShortlistListResult {
  entries: ShortlistEntry[]
}

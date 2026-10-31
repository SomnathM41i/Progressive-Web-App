import type { ProfilePreview } from '@/features/profiles/types'

/**
 * Profile-view feature contracts.
 *
 * Request shapes come from the "SVR Matrimony API Collection" Postman
 * collection (Features Master folder); response shapes were confirmed live:
 *
 * | Endpoint | Fields |
 * |---|---|
 * | `get-list-WhoViewedMyProfile.php` | `MatriID`, `page` |
 * | `get-list-MyViewedProfiles.php`   | `MatriID`, `page` |
 * | `update-ProfileViewCount.php`     | `ViewerID`, `ProfileID` |
 *
 * Lists answer `{ status, message, pagination, data[] }` with 8 rows per page.
 * A page past the end is still `success` with an empty `data`. Rows carry no
 * name, gender or location, so the service enriches them from the public
 * profile details endpoint.
 */

export interface ProfileViewsPagination {
  current_page?: number
  total_pages?: number
  total_records?: number
  per_page?: number
}

/** One row of either list endpoint. */
export interface ProfileViewApiRow {
  MatriID?: string | number
  Education?: string
  Occupation?: string
  Age?: string | number
  Height?: string
  /** "Who viewed me" returns a bare filename that lives under `/gallary/`. */
  Photo?: string
  /** "My viewed profiles" returns a root-relative `/gallary/...` path. */
  photo_url?: string
  /** `DD-MM-YYYY`. */
  ViewedOn?: string
}

export interface ProfileViewsListApiResponse {
  status?: unknown
  message?: string
  pagination?: ProfileViewsPagination
  data?: unknown
}

export interface ProfileViewActionResponse {
  status?: unknown
  message?: string
}

export interface ProfileViewEntry extends ProfilePreview {
  /** Raw `DD-MM-YYYY` date the view was recorded. */
  viewedOn?: string
}

export type ProfileViewsTab = 'viewedMe' | 'iViewed'

export interface ProfileViewsListResult {
  entries: ProfileViewEntry[]
  page: number
  totalPages: number
  totalRecords: number
}

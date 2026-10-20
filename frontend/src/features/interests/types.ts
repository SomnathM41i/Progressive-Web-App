import type { ProfilePreview } from '@/features/profiles/types'

/**
 * Interest feature contracts.
 *
 * Request shapes come from the "SVR Matrimony API Collection" Postman
 * collection (Features Master folder). Every interest endpoint is a form POST
 * carrying `MatriID`, plus `ReceiverID` or `SenderID` for the actions, and an
 * optional `page` for the two lists:
 *
 * | Endpoint | Extra fields |
 * |---|---|
 * | `getMyReceivedInterestList.php` | `page` |
 * | `getMyPendingInterestList.php`  | `page` (interests the member sent) |
 * | `send-interest.php`             | `ReceiverID` |
 * | `accept-interest.php`           | `SenderID` |
 * | `decline-Interest.php`          | `SenderID` |
 * | `mark-not-interested.php`       | `ReceiverID` |
 *
 * The collection ships no response samples, so the envelope types below follow
 * the conventions confirmed for this API family (`docs/profile-plan.md` and the
 * integrated auth/matches services): HTTP 200 even on failure, success decided
 * by the JSON `status` field rather than the status code, and rows under a
 * collection key such as `results` or `data`. Row field names mirror the ones
 * observed live on `get-mutual-matches.php`.
 */

/** Pagination block when a list endpoint reports it. */
export interface InterestPagination {
  current_page?: number
  total_pages?: number
  has_next?: boolean
}

/** One profile row as returned by the interest list endpoints. */
export interface InterestApiRow {
  MatriID: string
  Name?: string
  /** The pending list has been seen without `Name`; these are the fallbacks. */
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
  /** Interest timestamp; the API has used more than one key across endpoints. */
  SentDate?: string
  InterestDate?: string
  interest_date?: string
  created_at?: string
  sent_at?: string
}

/**
 * Envelope of the two list endpoints.
 *
 * The row array is read from whichever of these keys the API actually uses —
 * see `extractRows` in the service. Only `status` and `message` are relied on
 * for control flow.
 */
export interface InterestListApiResponse {
  status?: unknown
  message?: string
  pagination?: InterestPagination
  results?: unknown
  data?: unknown
  interests?: unknown
  list?: unknown
  records?: unknown
  items?: unknown
  total_pages?: number
  has_next?: boolean
}

/** Envelope of the send / accept / decline / mark-not-interested actions. */
export interface InterestActionResponse {
  status?: unknown
  message?: string
}

/** A profile shown in either interest list. */
export interface InterestEntry extends ProfilePreview {
  /** When this interest was sent, if the API reports it. */
  sentAt?: string
}

export type InterestTab = 'received' | 'sent'

export interface InterestListResult {
  entries: InterestEntry[]
  page: number
  /** True when another page can be requested. */
  hasMore: boolean
}

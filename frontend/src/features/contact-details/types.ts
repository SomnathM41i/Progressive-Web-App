import type { ProfilePreview } from '@/features/profiles/types'

/**
 * Contact-unlock contracts, confirmed live:
 *
 * | Endpoint | Fields |
 * |---|---|
 * | `ViewUserContactDetails.php`        | `MatriID`, `ProfileID` |
 * | `get-list-MyViewedContactDetails.php` | `MatriID`, `page` |
 *
 * The first unlock of a profile deducts one `remaining_contacts`; repeating it
 * for an unlocked profile does not. The list embeds `ContactDetails` in each
 * row (8 per page), so unlocked profiles can be shown without calling the
 * unlock endpoint at all.
 */
export interface ContactApiRecord {
  Name?: string
  FatherName?: string
  MotherName?: string
  Email?: string
  Mobile?: string
  Mobile2?: string
  DOB?: string
  PlaceOfBirth?: string
  TimeOfBirth?: string
  Address?: string
  Country?: string
  State?: string
  District?: string
  Taluka?: string
  City?: string
  WorkAddress?: string
  WorkCountry?: string
  WorkState?: string
  WorkDistrict?: string
  WorkTaluka?: string
  WorkCity?: string
}

export interface ContactViewResponse {
  status?: unknown
  message?: string
  data?: ContactApiRecord | null
}

export interface ViewedContactsResponse {
  status?: unknown
  message?: string
  pagination?: { current_page?: number; total_pages?: number; total_records?: number }
  data?: ViewedContactApiRow[]
}

export interface ViewedContactApiRow {
  MatriID?: string | number
  Education?: string
  Occupation?: string
  Age?: string | number
  Height?: string
  /** `DD-MM-YYYY`. */
  ViewedOn?: string
  ContactDetails?: ContactApiRecord | null
}

export interface ViewedContactEntry extends ProfilePreview {
  /** Raw `DD-MM-YYYY` date the contact was unlocked. */
  viewedOn?: string
  mobile: string | null
}

export interface ViewedContactsResult {
  entries: ViewedContactEntry[]
  page: number
  totalPages: number
  totalRecords: number
}

export interface ContactDetails {
  name: string | null
  fatherName: string | null
  motherName: string | null
  mobile: string | null
  alternateMobile: string | null
  email: string | null
  dateOfBirth: string | null
  placeOfBirth: string | null
  timeOfBirth: string | null
  address: string | null
  workAddress: string | null
}

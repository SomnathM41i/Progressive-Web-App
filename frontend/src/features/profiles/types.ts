/**
 * Canonical profile contracts shared by the dashboard, search, shortlist and
 * profile-detail screens.
 *
 * Field names describe the UI view model; they will be mapped from real API
 * resources once the backend collection is integrated.
 */
export interface ProfilePreview {
  id: string
  name: string
  age: number
  location: string
  occupation?: string
  gender?: 'Bride' | 'Groom'
  education?: string
  height?: string
  annualIncome?: string
  caste?: string
  maritalStatus?: string
  hometown?: string
  /** Absent or null renders the branded monogram avatar. */
  photoUrl?: string | null
  /** Only rendered when the backend explicitly confirms verification. */
  isVerified?: boolean
  isNew?: boolean
}

/** Extra detail shown on a full profile screen; most fields are pending the API. */
export interface ProfileDetail extends ProfilePreview {
  about?: string
  family?: string
}

/*
 * ── Own-profile ("My Profile") API contracts ───────────────────────────────
 *
 * The read endpoints in the SVR collection answer with `{ status, message,
 * data }`, but the exact field names inside `data` are not pinned down by saved
 * examples, so the DTOs below are intentionally loose: known keys are typed,
 * and an index signature keeps the raw record accessible for anything the
 * mapping does not yet name. The service maps these to the view models above.
 */

/** Shared envelope for the `get-*-details.php` family. */
export interface ProfileEnvelope<T> {
  status?: unknown
  message?: string
  data?: T
  [key: string]: unknown
}

interface RawRecord {
  [key: string]: unknown
}

export type ProfileApiRecord = RawRecord

/** A labelled field surfaced on a detail screen; `null` means not provided. */
export interface ProfileField {
  label: string
  value: string | null
  /** When true the value is a photo/document path needing URL resolution. */
  isMedia?: boolean
}

/** One section as rendered: an ordered list of rows, plus free-text blocks. */
export interface ProfileSection {
  fields: ProfileField[]
  /** Longer free-text blocks (about, expectations, family notes). */
  notes: ProfileField[]
}

export type ProfileSectionKey =
  | 'basic'
  | 'contact'
  | 'education'
  | 'family'
  | 'horoscope'
  | 'partnerPreference'

/** A single gallery photo. `url` is resolved to an absolute URL by the service. */
export interface GalleryPhoto {
  id: string
  name: string
  status?: string
  url: string
}

/** A single uploaded document. `url` is resolved to an absolute URL. */
export interface ProfileDocument {
  id: string
  name: string
  status?: string
  url: string | null
}

/** Biodata availability: the file URL when uploaded, otherwise null. */
export interface ProfileBiodata {
  available: boolean
  url: string | null
}

/** Privacy visibility toggles from `get-My-Settings.php`. */
export interface ProfileSettings {
  /** Raw API values, e.g. `paidhoro`, `paidphone`, `allphoto`. */
  horoscopeVisibility: string | null
  phoneVisibility: string | null
  photoVisibility: string | null
  /** Any additional settings keys the API returns, kept verbatim. */
  extra: Array<{ key: string; value: string }>
}

/** Membership plan summary from `getMyMembershipPlanDetails.php`. */
export interface MembershipPlan {
  planName: string | null
  activationDate: string | null
  expiryDate: string | null
  durationDays: string | null
  amount: string | null
  totalContacts: string | null
  remainingContacts: string | null
  paymentMode: string | null
  invoiceId: string | null
}

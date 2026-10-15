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
  /** Absent or null renders the branded monogram avatar. */
  photoUrl?: string | null
  /** Only rendered when the backend explicitly confirms verification. */
  isVerified?: boolean
  isNew?: boolean
}

/** Extra detail shown on a full profile screen; most fields are pending the API. */
export interface ProfileDetail extends ProfilePreview {
  about?: string
  education?: string
  family?: string
  height?: string
  maritalStatus?: string
}

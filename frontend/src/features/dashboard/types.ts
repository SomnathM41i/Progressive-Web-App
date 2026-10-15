/**
 * Dashboard data contracts.
 *
 * These describe what the dashboard screens render. Field names will be mapped
 * from the real API resources once the collection is integrated.
 */

export interface ProfilePreview {
  id: string
  name: string
  age: number
  location: string
  occupation?: string
  photoUrl?: string | null
  /** Only rendered when the backend explicitly confirms verification. */
  isVerified?: boolean
  isNew?: boolean
}

export interface ProfileSummary {
  name: string
  profileId: string
  /** Percentage of the profile that is complete, 0–100. */
  completion: number
  photoUrl?: string | null
  isVerified?: boolean
  /** Sections the member still needs to fill in. */
  missingFields: string[]
}

export interface Announcement {
  id: string
  title: string
  body: string
  /** ISO-8601 timestamp. */
  createdAt: string
  tone: 'info' | 'success' | 'warning'
}

export interface DashboardData {
  summary: ProfileSummary
  recommended: ProfilePreview[]
  recentlyAdded: ProfilePreview[]
  announcements: Announcement[]
}

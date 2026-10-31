import { createContext } from 'react'

export interface ProfilePhotoContextValue {
  /**
   * URL of the member's profile photo — the first photo in gallery order,
   * regardless of its moderation status — or `null` when there is none.
   */
  photoUrl: string | null
  /** True when that photo is still awaiting moderation. */
  photoPending: boolean
  /** Number of gallery photos, or `null` while unknown (loading or failed). */
  photoCount: number | null
  /** Re-fetches the gallery; called after the Photos screen changes. */
  reload: () => void
}

export const ProfilePhotoContext = createContext<ProfilePhotoContextValue | undefined>(
  undefined,
)

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  ProfilePhotoContext,
  type ProfilePhotoContextValue,
} from '@/features/profiles/context/profile-photo-context'
import { profileService } from '@/features/profiles/services/profile.service'

/**
 * Holds the member's profile photo for the whole app.
 *
 * There is no dedicated "profile photo" field in the API, so the photo is
 * derived from the gallery: the first photo returned by
 * `get-photo-gallery.php`, whatever its moderation status. That means a photo
 * still showing as *pending* still becomes the avatar, matching the gallery.
 * Signed-out sessions resolve to no photo, so avatars fall back to initials.
 *
 * The gallery is fetched once per session and re-fetched on demand (after the
 * Photos screen changes), keeping every avatar in sync without a per-screen
 * request.
 */
export function ProfilePhotoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const memberId = user?.profileId

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [reloadNonce, setReloadNonce] = useState(0)

  const reload = useCallback(() => setReloadNonce((value) => value + 1), [])

  useEffect(() => {
    // Drop any previous member's photo before this member's gallery resolves,
    // so switching accounts can never show the wrong face.
    setPhotoUrl(null)

    if (!memberId) return

    let cancelled = false

    profileService
      .fetchPhotos(memberId)
      .then((photos) => {
        if (cancelled) return
        setPhotoUrl(photos[0]?.url ?? null)
      })
      .catch(() => {
        if (cancelled) return
        // A failed gallery leaves no photo (initials fallback) rather than a
        // stale one from a different member.
        setPhotoUrl(null)
      })

    return () => {
      cancelled = true
    }
  }, [memberId, reloadNonce])

  // Derived, not stored: a signed-out session never shows a photo, so the
  // avatar falls back to initials without needing a state reset.
  const value = useMemo<ProfilePhotoContextValue>(
    () => ({ photoUrl: memberId ? photoUrl : null, reload }),
    [memberId, photoUrl, reload],
  )

  return (
    <ProfilePhotoContext.Provider value={value}>{children}</ProfilePhotoContext.Provider>
  )
}

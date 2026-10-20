import { useCallback } from 'react'

import { PhotoGallery } from '@/features/profiles/components/PhotoGallery'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useMyPhoto } from '@/features/profiles/hooks/useMyPhoto'
import { useProfileResource } from '@/features/profiles/hooks/useProfileResource'
import { profileService } from '@/features/profiles/services/profile.service'
import type { GalleryPhoto } from '@/features/profiles/types'

export function ProfilePhotosPage() {
  const { status, data, error, reload } = useProfileResource<GalleryPhoto[]>(
    profileService.fetchPhotos,
    [],
  )
  const { reload: reloadProfilePhoto } = useMyPhoto()

  // Retry refreshes the gallery and the app-wide avatar (its first photo).
  const handleReload = useCallback(() => {
    reload()
    reloadProfilePhoto()
  }, [reload, reloadProfilePhoto])

  return (
    <SectionState
      title="My photos"
      status={status}
      error={error}
      reload={handleReload}
      skeletonRows={4}
    >
      <PhotoGallery photos={data ?? []} />
    </SectionState>
  )
}

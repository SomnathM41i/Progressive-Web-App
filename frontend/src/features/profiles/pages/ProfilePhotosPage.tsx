import { useCallback, useRef, useState } from 'react'

import { Camera, Images, Upload } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PhotoGallery } from '@/features/profiles/components/PhotoGallery'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useMyPhoto } from '@/features/profiles/hooks/useMyPhoto'
import { useProfileResource } from '@/features/profiles/hooks/useProfileResource'
import { profileService } from '@/features/profiles/services/profile.service'
import { profileUploadService } from '@/features/profiles/services/profile-upload.service'
import type { GalleryPhoto } from '@/features/profiles/types'
import { useToast } from '@/hooks/useToast'
import { toApiError } from '@/services/api-error'

export function ProfilePhotosPage() {
  const { status, data, error, reload } = useProfileResource<GalleryPhoto[]>(
    profileService.fetchPhotos,
    [],
  )
  const { reload: reloadProfilePhoto } = useMyPhoto()
  const { user } = useAuth()
  const toast = useToast()
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [galleryFile, setGalleryFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState<'profile' | 'gallery' | null>(null)
  const profileInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  // Retry refreshes the gallery and the app-wide avatar (its first photo).
  const handleReload = useCallback(() => {
    reload()
    reloadProfilePhoto()
  }, [reload, reloadProfilePhoto])

  async function uploadPhoto(kind: 'profile' | 'gallery') {
    const file = kind === 'profile' ? profileFile : galleryFile
    const matriId = user?.profileId?.trim()
    if (!matriId) {
      toast.error('Missing profile ID')
      return
    }
    if (!file) {
      toast.error(`Select a ${kind === 'profile' ? 'profile' : 'gallery'} photo first`)
      return
    }

    setUploading(kind)
    try {
      const result =
        kind === 'profile'
          ? await profileUploadService.uploadProfilePhoto(matriId, file)
          : await profileUploadService.uploadGalleryPhoto(matriId, file)
      toast.success(kind === 'profile' ? 'Profile photo uploaded' : 'Gallery photo uploaded', {
        description: result.message || undefined,
      })
      if (kind === 'profile') {
        setProfileFile(null)
        if (profileInputRef.current) profileInputRef.current.value = ''
      } else {
        setGalleryFile(null)
        if (galleryInputRef.current) galleryInputRef.current.value = ''
      }
      handleReload()
    } catch (error) {
      toast.error('Could not upload photo', { description: toApiError(error).message })
    } finally {
      setUploading(null)
    }
  }

  return (
    <SectionState
      title="My photos"
      status={status}
      error={error}
      reload={handleReload}
      skeletonRows={4}
      alwaysShowChildren
    >
      <div className="space-y-4">
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-maroon">
            <Camera className="size-4" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Profile photo</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            This photo represents you across the app. Choose a clear portrait image.
          </p>
          <input
            ref={profileInputRef}
            type="file"
            aria-label="Choose profile photo"
            accept="image/*"
            onChange={(event) => setProfileFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-rose file:px-3 file:py-2 file:text-xs file:font-semibold file:text-maroon"
          />
          {profileFile ? <p className="text-xs text-muted">Selected: {profileFile.name}</p> : null}
          <Button
            fullWidth
            disabled={uploading !== null}
            onClick={() => void uploadPhoto('profile')}
            leadingIcon={<Upload className="size-4" aria-hidden="true" />}
          >
            {uploading === 'profile' ? 'Uploading profile photo…' : 'Upload profile photo'}
          </Button>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-maroon">
            <Images className="size-4" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Add gallery photo</h2>
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            aria-label="Choose gallery photo"
            accept="image/*"
            onChange={(event) => setGalleryFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-rose file:px-3 file:py-2 file:text-xs file:font-semibold file:text-maroon"
          />
          {galleryFile ? <p className="text-xs text-muted">Selected: {galleryFile.name}</p> : null}
          <Button
            fullWidth
            variant="outline"
            disabled={uploading !== null}
            onClick={() => void uploadPhoto('gallery')}
            leadingIcon={<Upload className="size-4" aria-hidden="true" />}
          >
            {uploading === 'gallery' ? 'Uploading gallery photo…' : 'Upload gallery photo'}
          </Button>
        </Card>

        <PhotoGallery photos={data ?? []} />
      </div>
    </SectionState>
  )
}

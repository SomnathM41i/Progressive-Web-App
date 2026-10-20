import { useContext } from 'react'

import {
  ProfilePhotoContext,
  type ProfilePhotoContextValue,
} from '@/features/profiles/context/profile-photo-context'

export function useMyPhoto(): ProfilePhotoContextValue {
  const context = useContext(ProfilePhotoContext)

  if (!context) {
    throw new Error('useMyPhoto must be used inside <ProfilePhotoProvider>.')
  }

  return context
}

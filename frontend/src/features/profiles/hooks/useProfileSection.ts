import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAsyncResource, type AsyncResource } from '@/hooks/useAsyncResource'
import type { ProfileSection } from '@/features/profiles/types'

/**
 * Loads one own-profile text section for the signed-in member.
 *
 * Wraps `useAsyncResource` so each section screen is a single call. When there
 * is no signed-in profile id the loader resolves to an empty section rather
 * than hitting the API with a blank MatriID.
 */
export function useProfileSection(
  loader: (matriId: string) => Promise<ProfileSection>,
): AsyncResource<ProfileSection> {
  const { user } = useAuth()
  const matriId = user?.profileId ?? ''

  return useAsyncResource<ProfileSection>(() => {
    if (!matriId) return Promise.resolve({ fields: [], notes: [] })
    return loader(matriId)
  }, [matriId])
}

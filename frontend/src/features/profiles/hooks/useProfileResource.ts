import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAsyncResource, type AsyncResource } from '@/hooks/useAsyncResource'

/**
 * Loads any own-profile resource for the signed-in member by MatriID.
 *
 * Shared by the photo, document, biodata, settings and membership screens so
 * each is a single call. With no signed-in profile id the loader returns the
 * provided empty value instead of querying with a blank MatriID.
 */
export function useProfileResource<T>(
  loader: (matriId: string) => Promise<T>,
  empty: T,
): AsyncResource<T> {
  const { user } = useAuth()
  const matriId = user?.profileId ?? ''

  return useAsyncResource<T>(() => {
    if (!matriId) return Promise.resolve(empty)
    return loader(matriId)
  }, [matriId])
}

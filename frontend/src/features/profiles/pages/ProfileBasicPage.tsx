import { DetailSection } from '@/features/profiles/components/DetailSection'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useProfileSection } from '@/features/profiles/hooks/useProfileSection'
import { profileService } from '@/features/profiles/services/profile.service'

export function ProfileBasicPage() {
  const { status, data, error, reload } = useProfileSection(profileService.fetchBasic)

  return (
    <SectionState title="Basic details" status={status} error={error} reload={reload} skeletonRows={8}>
      <DetailSection title="Basic details" fields={data?.fields ?? []} notes={data?.notes ?? []} />
    </SectionState>
  )
}

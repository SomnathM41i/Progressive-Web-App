import { DetailSection } from '@/features/profiles/components/DetailSection'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useProfileSection } from '@/features/profiles/hooks/useProfileSection'
import { profileService } from '@/features/profiles/services/profile.service'

export function ProfileFamilyPage() {
  const { status, data, error, reload } = useProfileSection(profileService.fetchFamily)

  return (
    <SectionState title="Family details" status={status} error={error} reload={reload} skeletonRows={8}>
      <DetailSection title="Family details" fields={data?.fields ?? []} notes={data?.notes ?? []} />
    </SectionState>
  )
}

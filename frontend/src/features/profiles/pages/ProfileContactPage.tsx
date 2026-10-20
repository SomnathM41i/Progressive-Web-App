import { DetailSection } from '@/features/profiles/components/DetailSection'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useProfileSection } from '@/features/profiles/hooks/useProfileSection'
import { profileService } from '@/features/profiles/services/profile.service'

export function ProfileContactPage() {
  const { status, data, error, reload } = useProfileSection(profileService.fetchContact)

  return (
    <SectionState title="Contact details" status={status} error={error} reload={reload} skeletonRows={7}>
      <DetailSection title="Contact details" fields={data?.fields ?? []} notes={data?.notes ?? []} />
    </SectionState>
  )
}

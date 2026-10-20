import { DetailSection } from '@/features/profiles/components/DetailSection'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useProfileSection } from '@/features/profiles/hooks/useProfileSection'
import { profileService } from '@/features/profiles/services/profile.service'

export function ProfileEducationPage() {
  const { status, data, error, reload } = useProfileSection(profileService.fetchEducation)

  return (
    <SectionState
      title="Education & career"
      status={status}
      error={error}
      reload={reload}
      skeletonRows={7}
    >
      <DetailSection
        title="Education & career"
        fields={data?.fields ?? []}
        notes={data?.notes ?? []}
      />
    </SectionState>
  )
}

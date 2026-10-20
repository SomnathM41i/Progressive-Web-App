import { DetailSection } from '@/features/profiles/components/DetailSection'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useProfileSection } from '@/features/profiles/hooks/useProfileSection'
import { profileService } from '@/features/profiles/services/profile.service'

export function ProfilePartnerPreferencePage() {
  const { status, data, error, reload } = useProfileSection(profileService.fetchPartnerPreference)

  return (
    <SectionState
      title="Partner preference"
      status={status}
      error={error}
      reload={reload}
      skeletonRows={8}
    >
      <DetailSection
        title="Partner preference"
        fields={data?.fields ?? []}
        notes={data?.notes ?? []}
      />
    </SectionState>
  )
}

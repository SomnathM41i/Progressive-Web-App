import { DetailSection } from '@/features/profiles/components/DetailSection'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useProfileSection } from '@/features/profiles/hooks/useProfileSection'
import { profileService } from '@/features/profiles/services/profile.service'

export function ProfileHoroscopePage() {
  const { status, data, error, reload } = useProfileSection(profileService.fetchHoroscope)

  return (
    <SectionState title="Horoscope details" status={status} error={error} reload={reload} skeletonRows={8}>
      <DetailSection title="Horoscope details" fields={data?.fields ?? []} notes={data?.notes ?? []} />
    </SectionState>
  )
}

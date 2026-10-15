import { Page } from '@/components/ui/Page'
import { ComingSoon } from '@/components/states/ComingSoon'

export function ProfileEditPage() {
  return (
    <Page title="Edit profile" subtitle="Update your details.">
      <ComingSoon
        title="Edit profile"
        description="The profile form and photo upload will be available once the API collection is connected."
      />
    </Page>
  )
}

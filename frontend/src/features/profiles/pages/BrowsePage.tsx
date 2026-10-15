import { Page } from '@/components/ui/Page'
import { ComingSoon } from '@/components/states/ComingSoon'

export function BrowsePage() {
  return (
    <Page
      title="Browse profiles"
      subtitle="All profiles from the community, in one place."
    >
      <ComingSoon
        title="Browse profiles"
        description="Browse and filter will be available once the API collection is connected."
      />
    </Page>
  )
}

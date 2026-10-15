import { Page } from '@/components/ui/Page'
import { ComingSoon } from '@/components/states/ComingSoon'

export function ShortlistPage() {
  return (
    <Page title="Shortlist" subtitle="Profiles you have saved.">
      <ComingSoon
        title="Saved profiles"
        description="Shortlisting will be available once the API collection is connected."
      />
    </Page>
  )
}

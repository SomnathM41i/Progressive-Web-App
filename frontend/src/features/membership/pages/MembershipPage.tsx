import { Page } from '@/components/ui/Page'
import { ComingSoon } from '@/components/states/ComingSoon'

export function MembershipPage() {
  return (
    <Page title="Membership" subtitle="Your membership status and plans.">
      <ComingSoon
        title="Membership"
        description="Membership plans and payments will be available once the API collection is connected."
      />
    </Page>
  )
}

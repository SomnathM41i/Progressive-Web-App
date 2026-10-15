import { Page } from '@/components/ui/Page'
import { ComingSoon } from '@/components/states/ComingSoon'

export function NotificationsPage() {
  return (
    <Page title="Notifications" subtitle="Updates about your account and profiles.">
      <ComingSoon
        title="Notifications"
        description="Your notifications will appear here once the API collection is connected."
      />
    </Page>
  )
}

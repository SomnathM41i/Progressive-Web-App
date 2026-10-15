import { Page } from '@/components/ui/Page'
import { ComingSoon } from '@/components/states/ComingSoon'
import { PreviewNotice } from '@/components/feedback/PreviewNotice'
import { env } from '@/config/env'

export function InterestsPage() {
  return (
    <Page title="Interests" subtitle="Requests you have sent and received.">
      {env.devPreview ? <PreviewNotice /> : null}
      <ComingSoon
        title="Interest requests"
        description="Sending and accepting interests will be available once the API collection is connected."
      />
    </Page>
  )
}

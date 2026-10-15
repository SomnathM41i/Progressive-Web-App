import { Page } from '@/components/ui/Page'
import { ComingSoon } from '@/components/states/ComingSoon'
import { PreviewNotice } from '@/components/feedback/PreviewNotice'
import { env } from '@/config/env'

export function ChatPage() {
  return (
    <Page title="Chat" subtitle="Your conversations.">
      {env.devPreview ? <PreviewNotice /> : null}
      <ComingSoon
        title="Messages"
        description="Chat with your matches will be available once the API collection is connected."
      />
    </Page>
  )
}

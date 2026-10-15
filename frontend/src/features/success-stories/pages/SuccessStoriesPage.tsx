import { Page } from '@/components/ui/Page'
import { ComingSoon } from '@/components/states/ComingSoon'
import { PreviewNotice } from '@/components/feedback/PreviewNotice'
import { env } from '@/config/env'

export function SuccessStoriesPage() {
  return (
    <Page title="Success stories" subtitle="जोड्या जुळल्या, घरं सजली.">
      {env.devPreview ? <PreviewNotice /> : null}
      <ComingSoon
        title="Success stories"
        description="Published stories from the centre will appear here once the API collection is connected."
      />
    </Page>
  )
}

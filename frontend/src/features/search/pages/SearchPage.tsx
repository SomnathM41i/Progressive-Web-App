import { Page } from '@/components/ui/Page'
import { ComingSoon } from '@/components/states/ComingSoon'

export function SearchPage() {
  return (
    <Page
      title="Search profiles"
      subtitle="Find matches by age, education and location."
    >
      <ComingSoon
        title="Advanced search"
        description="Search filters and results will appear here once the API collection is connected."
      />
    </Page>
  )
}

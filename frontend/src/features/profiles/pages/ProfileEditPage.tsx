import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { ComingSoon } from '@/components/states/ComingSoon'

export function ProfileEditPage() {
  return (
    <AppScreen>
      <ScreenHeader title="Edit profile" />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
        <ComingSoon
          title="Edit profile"
          description="The profile form and photo upload will be available once the API collection is connected."
        />
      </main>
    </AppScreen>
  )
}

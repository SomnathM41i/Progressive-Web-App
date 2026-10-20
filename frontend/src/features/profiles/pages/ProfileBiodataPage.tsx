import { FileDown, FileText } from 'lucide-react'

import { EmptyState } from '@/components/states/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useProfileResource } from '@/features/profiles/hooks/useProfileResource'
import { profileService } from '@/features/profiles/services/profile.service'
import type { ProfileBiodata } from '@/features/profiles/types'
import { useToast } from '@/hooks/useToast'

const EMPTY: ProfileBiodata = { available: false, url: null }

export function ProfileBiodataPage() {
  const { status, data, error, reload } = useProfileResource<ProfileBiodata>(
    profileService.fetchBiodata,
    EMPTY,
  )
  const toast = useToast()

  const biodata = data ?? EMPTY

  function openBiodata() {
    const url = biodata.url
    if (!url) return
    const opened = window.open(url, '_blank', 'noopener')
    // A blocked popup returns null; tell the member so the tap is not lost.
    if (!opened) {
      toast.info(`Allow pop-ups to open the biodata, or visit ${url}`)
    }
  }

  return (
    <SectionState title="Biodata" status={status} error={error} reload={reload} skeletonRows={4}>
      {biodata.available && biodata.url ? (
        <Card className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-rose text-maroon">
            <FileText className="size-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Your biodata is ready</p>
            <p className="mt-1 text-xs text-muted">
              Open or download the biodata file you uploaded.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={openBiodata}
            leadingIcon={<FileDown className="size-4" aria-hidden="true" />}
          >
            Open biodata
          </Button>
        </Card>
      ) : (
        <EmptyState
          icon={<FileText className="size-6" aria-hidden="true" />}
          title="No biodata uploaded"
          description="Once you add a biodata file, it will appear here."
        />
      )}
    </SectionState>
  )
}

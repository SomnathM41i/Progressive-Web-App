import { useRef, useState } from 'react'

import { FileDown, FileText, Upload } from 'lucide-react'

import { EmptyState } from '@/components/states/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useProfileResource } from '@/features/profiles/hooks/useProfileResource'
import { profileService } from '@/features/profiles/services/profile.service'
import { profileUploadService } from '@/features/profiles/services/profile-upload.service'
import type { ProfileBiodata } from '@/features/profiles/types'
import { useToast } from '@/hooks/useToast'
import { toApiError } from '@/services/api-error'

const EMPTY: ProfileBiodata = { available: false, url: null }

export function ProfileBiodataPage() {
  const { status, data, error, reload } = useProfileResource<ProfileBiodata>(
    profileService.fetchBiodata,
    EMPTY,
  )
  const toast = useToast()
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  async function uploadBiodata() {
    const matriId = user?.profileId?.trim()
    if (!matriId) {
      toast.error('Missing profile ID')
      return
    }
    if (!file) {
      toast.error('Select a biodata file first')
      return
    }

    setUploading(true)
    try {
      const result = await profileUploadService.uploadBiodata(matriId, file)
      toast.success('Biodata uploaded', { description: result.message || undefined })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      reload()
    } catch (error) {
      toast.error('Could not upload biodata', { description: toApiError(error).message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <SectionState title="Biodata" status={status} error={error} reload={reload} skeletonRows={4} alwaysShowChildren>
      <div className="space-y-4">
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-maroon">Upload biodata</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-rose file:px-3 file:py-2 file:text-xs file:font-semibold file:text-maroon"
          />
          {file ? <p className="text-xs text-muted">Selected: {file.name}</p> : null}
          <Button
            fullWidth
            disabled={uploading}
            onClick={() => void uploadBiodata()}
            leadingIcon={<Upload className="size-4" aria-hidden="true" />}
          >
            {uploading ? 'Uploading biodata…' : 'Upload biodata'}
          </Button>
        </Card>

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
      </div>
    </SectionState>
  )
}

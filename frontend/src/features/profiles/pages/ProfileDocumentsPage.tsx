import { useRef, useState } from 'react'

import { FileText, Upload } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/states/EmptyState'
import { Card } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/SelectField'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useProfileResource } from '@/features/profiles/hooks/useProfileResource'
import { profileService } from '@/features/profiles/services/profile.service'
import {
  DOCUMENT_TYPE_OPTIONS,
  profileUploadService,
  type DocumentType,
} from '@/features/profiles/services/profile-upload.service'
import type { ProfileDocument } from '@/features/profiles/types'
import { useToast } from '@/hooks/useToast'
import { toApiError } from '@/services/api-error'

export function ProfileDocumentsPage() {
  const { status, data, error, reload } = useProfileResource<ProfileDocument[]>(
    profileService.fetchDocuments,
    [],
  )
  const { user } = useAuth()
  const toast = useToast()
  const [documentType, setDocumentType] = useState<DocumentType>('0')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const documents = data ?? []

  async function uploadDocument() {
    const matriId = user?.profileId?.trim()
    if (!matriId) {
      toast.error('Missing profile ID')
      return
    }
    if (!documentType) {
      toast.error('Select a document type')
      return
    }
    if (!file) {
      toast.error('Select a document first')
      return
    }

    setUploading(true)
    try {
      const result = await profileUploadService.uploadDocument(matriId, documentType, file)
      toast.success('Document uploaded', { description: result.message || undefined })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      reload()
    } catch (error) {
      toast.error('Could not upload document', { description: toApiError(error).message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <SectionState title="My documents" status={status} error={error} reload={reload} skeletonRows={4} alwaysShowChildren>
      <div className="space-y-4">
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-maroon">Upload a document</h2>
          <SelectField
            label="Document type"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value as DocumentType)}
            options={DOCUMENT_TYPE_OPTIONS}
          />
          <input
            ref={fileInputRef}
            type="file"
            aria-label="Choose document"
            accept="application/pdf,image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-rose file:px-3 file:py-2 file:text-xs file:font-semibold file:text-maroon"
          />
          {file ? <p className="text-xs text-muted">Selected: {file.name}</p> : null}
          <Button
            fullWidth
            disabled={uploading}
            onClick={() => void uploadDocument()}
            leadingIcon={<Upload className="size-4" aria-hidden="true" />}
          >
            {uploading ? 'Uploading document…' : 'Upload document'}
          </Button>
        </Card>

        {documents.length ? (
          <ul className="space-y-2">
            {documents.map((document) => (
              <li key={document.id}>
                <a
                  href={document.url ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <Card className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose text-maroon">
                      <FileText className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {document.name}
                      </span>
                      {document.status ? (
                        <span className="mt-0.5 block text-xs text-muted">{document.status}</span>
                      ) : null}
                    </span>
                  </Card>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<FileText className="size-6" aria-hidden="true" />}
            title="No documents yet"
            description="Documents you upload will be listed here."
          />
        )}
      </div>
    </SectionState>
  )
}

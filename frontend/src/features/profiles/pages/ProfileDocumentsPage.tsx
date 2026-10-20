import { FileText } from 'lucide-react'

import { EmptyState } from '@/components/states/EmptyState'
import { Card } from '@/components/ui/Card'
import { SectionState } from '@/features/profiles/components/SectionState'
import { useProfileResource } from '@/features/profiles/hooks/useProfileResource'
import { profileService } from '@/features/profiles/services/profile.service'
import type { ProfileDocument } from '@/features/profiles/types'

export function ProfileDocumentsPage() {
  const { status, data, error, reload } = useProfileResource<ProfileDocument[]>(
    profileService.fetchDocuments,
    [],
  )

  const documents = data ?? []

  return (
    <SectionState title="My documents" status={status} error={error} reload={reload} skeletonRows={4}>
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
    </SectionState>
  )
}

import { useState } from 'react'

import { ImageOff } from 'lucide-react'

import { EmptyState } from '@/components/states/EmptyState'
import { Badge } from '@/components/ui/Badge'
import type { GalleryPhoto } from '@/features/profiles/types'

interface PhotoGalleryProps {
  photos: GalleryPhoto[]
}

function PhotoTile({ photo }: { photo: GalleryPhoto }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className="flex aspect-3/4 items-center justify-center rounded-md bg-cream-dark text-muted">
        <ImageOff className="size-6" aria-hidden="true" />
      </span>
    )
  }

  return (
    <img
      src={photo.url}
      alt={photo.name}
      loading="lazy"
      className="aspect-3/4 w-full rounded-md object-cover"
      onError={() => setFailed(true)}
    />
  )
}

/** Responsive grid of gallery photos with a designed empty/error state. */
export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (!photos.length) {
    return (
      <EmptyState
        icon={<ImageOff className="size-6" aria-hidden="true" />}
        title="No photos yet"
        description="Photos you add to your profile gallery will appear here."
      />
    )
  }

  return (
    <ul className="grid grid-cols-3 gap-2">
      {photos.map((photo, index) => (
        <li key={`${photo.id}-${index}`} className="relative">
          <PhotoTile photo={photo} />
          {photo.status ? (
            <Badge tone="neutral" className="absolute bottom-1 left-1">
              {photo.status}
            </Badge>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

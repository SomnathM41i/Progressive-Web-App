import { useState } from 'react'

import { cn } from '@/lib/cn'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const sizes: Record<Size, string> = {
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-16 text-lg',
  xl: 'size-20 text-xl',
}

interface AvatarProps {
  src?: string | null
  name: string
  size?: Size
  className?: string
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

/**
 * Profile picture with a graceful fallback.
 *
 * Matrimonial profiles often have no photo, so the fallback is a designed
 * monogram rather than a broken image.
 */
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-gradient-to-br from-maroon to-maroon-dark font-semibold text-white',
        'ring-2 ring-white',
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={name}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
      {showImage ? null : <span className="sr-only">{name}</span>}
    </span>
  )
}

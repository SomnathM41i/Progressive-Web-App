import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/cn'

interface ScreenHeaderProps {
  title: string
  trailing?: ReactNode
  className?: string
  onBack?: () => void
}

/** Consistent app bar for full-screen mobile routes. */
export function ScreenHeader({ title, trailing, className, onBack }: ScreenHeaderProps) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => void navigate(-1))

  return (
    <header className={cn('sticky top-0 z-30 flex h-[var(--app-header-height)] shrink-0 items-center justify-center border-b border-line bg-white px-3 shadow-bar', className)}>
      <IconButton label="Go back" size="md" variant="plain" onClick={handleBack} className="absolute left-1.5">
        <ChevronLeft className="size-5" aria-hidden="true" />
      </IconButton>
      <h1 className="max-w-[calc(100%-7rem)] truncate text-sm font-semibold text-ink">{title}</h1>
      {trailing ? <div className="absolute right-2 flex items-center">{trailing}</div> : null}
    </header>
  )
}

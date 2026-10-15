import type { ReactNode } from 'react'

interface PageProps {
  title: string
  subtitle?: string
  children: ReactNode
}

/** Standard inner-page frame: padded container with a title block. */
export function Page({ title, subtitle, children }: PageProps) {
  return (
    <div className="space-y-5 px-4 pt-6 pb-6">
      <header>
        <h1 className="text-2xl text-maroon">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </header>
      {children}
    </div>
  )
}

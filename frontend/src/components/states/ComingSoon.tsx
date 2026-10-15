import { Construction } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

interface ComingSoonProps {
  title: string
  description: string
  /** Optional call to action rendered below the description. */
  action?: ReactNode
}

/**
 * Deliberate placeholder for a destination that exists in navigation but is not
 * implemented yet. It is intentionally explicit so nobody mistakes it for a
 * finished screen.
 */
export function ComingSoon({ title, description, action }: ComingSoonProps) {
  return (
    <Card className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-rose text-maroon">
        <Construction className="size-7" aria-hidden="true" />
      </span>
      <Badge tone="brand">Coming soon</Badge>
      <h2 className="mt-3 text-lg text-maroon">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  )
}

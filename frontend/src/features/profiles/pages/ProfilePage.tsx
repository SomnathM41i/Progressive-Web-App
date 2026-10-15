import { LogOut, Mail, Phone, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ComingSoon } from '@/components/states/ComingSoon'
import { PreviewNotice } from '@/components/feedback/PreviewNotice'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Page } from '@/components/ui/Page'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export function ProfilePage() {
  const { user, isPreview, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.info('Logged out')
    void navigate(routes.welcome, { replace: true })
  }

  return (
    <Page title="My profile">
      {isPreview ? <PreviewNotice /> : null}

      <Card className="flex items-center gap-4">
        <Avatar src={user?.avatarUrl} name={user?.name ?? 'Member'} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-ink">
            {user?.name ?? 'Member'}
          </p>
          {user?.profileId ? (
            <p className="mt-0.5 text-xs text-muted">Profile ID · {user.profileId}</p>
          ) : null}
        </div>
      </Card>

      {user?.email || user?.phone ? (
        <Card flush>
          <dl className="divide-y divide-line">
            {user.email ? (
              <div className="flex items-center gap-3 px-5 py-3.5">
                <Mail className="size-4 text-muted" aria-hidden="true" />
                <dt className="sr-only">Email</dt>
                <dd className="text-sm text-ink">{user.email}</dd>
              </div>
            ) : null}
            {user.phone ? (
              <div className="flex items-center gap-3 px-5 py-3.5">
                <Phone className="size-4 text-muted" aria-hidden="true" />
                <dt className="sr-only">Mobile</dt>
                <dd className="text-sm text-ink">{user.phone}</dd>
              </div>
            ) : null}
          </dl>
        </Card>
      ) : null}

      <ComingSoon
        title="Profile details"
        description="Education, family details and photos will appear here once the API collection is connected."
      />

      <Button
        variant="outline"
        fullWidth
        onClick={() => void handleLogout()}
        leadingIcon={<LogOut className="size-4" aria-hidden="true" />}
      >
        Log out
      </Button>

      <p className="flex items-center justify-center gap-1.5 pt-2 text-2xs text-muted">
        <UserRound className="size-3.5" aria-hidden="true" />
        शिवराज मराठा वधू वर सूचक केंद्र ®
      </p>
    </Page>
  )
}

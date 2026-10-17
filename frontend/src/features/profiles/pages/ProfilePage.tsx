import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Mail, PencilLine, Phone, UserRound } from 'lucide-react'

import { ComingSoon } from '@/components/states/ComingSoon'
import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { PreviewNotice } from '@/components/feedback/PreviewNotice'
import { AppScreen } from '@/components/ui/AppScreen'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
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
    <AppScreen>
      <ScreenHeader title="My profile" trailing={<Link to={routes.profileEdit} aria-label="Edit profile" className="flex size-9 items-center justify-center rounded-full text-maroon hover:bg-rose"><PencilLine className="size-4" /></Link>} />

      <main className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4">
        {isPreview ? <PreviewNotice /> : null}
        <Card className="flex items-center gap-4">
          <Avatar src={user?.avatarUrl} name={user?.name ?? 'Member'} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-ink">{user?.name ?? 'Member'}</p>
            {user?.profileId ? <p className="mt-0.5 text-xs text-muted">Profile ID · {user.profileId}</p> : null}
            <p className="mt-1 text-[11px] text-muted">Your profile and account details</p>
          </div>
        </Card>

        {user?.email || user?.phone ? <Card flush><dl className="divide-y divide-line">
          {user.email ? <div className="flex items-center gap-3 px-5 py-3.5"><Mail className="size-4 text-muted" aria-hidden="true" /><dt className="sr-only">Email</dt><dd className="text-sm text-ink">{user.email}</dd></div> : null}
          {user.phone ? <div className="flex items-center gap-3 px-5 py-3.5"><Phone className="size-4 text-muted" aria-hidden="true" /><dt className="sr-only">Mobile</dt><dd className="text-sm text-ink">{user.phone}</dd></div> : null}
        </dl></Card> : null}

        <ComingSoon title="Profile details" description="Education, family details and photos will appear here once the profile form is connected." />
        <p className="flex items-center justify-center gap-1.5 pt-1 text-2xs text-muted"><UserRound className="size-3.5" aria-hidden="true" />Shivaraj Maratha Matrimony</p>
      </main>

      <footer className="shrink-0 border-t border-line bg-white px-4 py-3">
        <Button variant="outline" fullWidth onClick={() => void handleLogout()} leadingIcon={<LogOut className="size-4" aria-hidden="true" />}>Log out</Button>
      </footer>
    </AppScreen>
  )
}

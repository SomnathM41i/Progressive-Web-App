import { ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import logo from '@/assets/images/shivraj-logo.png'
import { Button } from '@/components/ui/Button'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { env } from '@/config/env'

const TAGLINE = 'योग्य नात्यांची विश्वासार्ह सुरुवात'

const trustPoints = [
  { icon: ShieldCheck, label: 'सत्यापित प्रोफाइल' },
  { icon: Users, label: 'फक्त मराठा समाज' },
  { icon: Sparkles, label: '2013 पासून विश्वासार्ह' },
]

export function WelcomePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { login } = useAuth()

  async function handlePreview() {
    await login({ identifier: 'preview', password: 'preview' })
    toast.success('Preview mode started')
    void navigate(routes.home, { replace: true })
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-safe pb-safe">
      <div className="relative flex flex-1 flex-col items-center justify-center py-10 text-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-4 left-1/2 size-64 -translate-x-1/2 rounded-full bg-gradient-to-b from-gold/20 to-transparent blur-3xl"
        />

        <img
          src={logo}
          alt="Shivaraj Maratha"
          width={112}
          height={112}
          className="relative size-28 object-contain sm:size-32"
        />

        <h1 className="relative mt-5 text-3xl text-maroon">शिवराज मराठा</h1>
        <p className="relative mt-1 text-2xs font-semibold tracking-[0.16em] text-gold uppercase">
          वधू वर सूचक केंद्र ®
        </p>

        <p className="relative mt-6 max-w-sm text-base leading-relaxed text-ink">
          {TAGLINE}
        </p>
        <p className="relative mt-3 max-w-sm text-xs leading-relaxed text-muted">
          मराठा समाजातील वधू-वरांसाठी सन्माननीय, सुरक्षित आणि विश्वासार्ह विवाह
          माध्यम.
        </p>

        <ul className="relative mt-8 flex flex-wrap justify-center gap-2">
          {trustPoints.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-2xs font-semibold text-muted"
            >
              <Icon className="size-3.5 text-gold" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 pb-6">
        <Button
          fullWidth
          size="lg"
          trailingIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          onClick={() => void navigate(routes.login)}
        >
          Login
        </Button>

        <Button fullWidth size="lg" variant="outline" onClick={() => void navigate(routes.register)}>
          Register
        </Button>

        {env.devPreview ? (
          <Button fullWidth size="sm" variant="ghost" onClick={() => void handlePreview()}>
            Dashboard preview (development)
          </Button>
        ) : null}
      </div>
    </div>
  )
}

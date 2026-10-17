import { ArrowRight, Heart, ShieldCheck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import logo from '@/assets/images/shivraj-logo.png'
import { Button } from '@/components/ui/Button'
import { routes } from '@/config/routes'

export function WelcomePage() {
  const navigate = useNavigate()
  return (
    <div className="welcome-screen flex flex-1 flex-col px-6 pt-safe pb-safe">
      <div className="relative flex flex-1 flex-col items-center justify-center py-8 text-center">
        <div className="welcome-flower welcome-flower-top" aria-hidden="true">
          ✿
        </div>
        <img
          src={logo}
          alt="Shivaraj Maratha"
          width={112}
          height={112}
          className="relative size-28 object-contain sm:size-32"
        />
        <h1 className="relative mt-3 text-3xl text-maroon">शिवराज मराठा</h1>
        <p className="relative mt-1 text-2xs font-semibold tracking-[0.22em] text-maroon/80 uppercase">
          वधू वर सूचक केंद्र
        </p>
        <p
          className="relative mt-6 max-w-sm text-base leading-relaxed text-ink"
          lang="mr"
        >
          योग्य नात्यांची विश्वासार्ह सुरुवात
        </p>
        <div className="welcome-hands" aria-hidden="true" />
        <div className="mt-auto grid w-full max-w-sm grid-cols-3 gap-2 pt-5 text-center">
          {[
            { icon: ShieldCheck, label: 'Verified profiles' },
            { icon: Heart, label: 'Meaningful matches' },
            { icon: Users, label: 'Trusted community' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-white/80 px-2 py-3 text-2xs font-medium text-muted"
            >
              <Icon className="size-5 text-maroon" />
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-sm space-y-3 pb-6">
        <Button
          fullWidth
          size="lg"
          trailingIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          onClick={() => void navigate(routes.register)}
        >
          Create an account
        </Button>
        <Button
          fullWidth
          size="lg"
          variant="outline"
          onClick={() => void navigate(routes.login)}
        >
          Log in
        </Button>
      </div>
    </div>
  )
}

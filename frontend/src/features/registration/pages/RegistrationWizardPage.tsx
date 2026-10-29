import { ChevronLeft } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { PageLoader } from '@/components/loading/PageLoader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { RegistrationProvider } from '@/features/registration/context/RegistrationProvider'
import { useRegistration } from '@/features/registration/hooks/useRegistration'
import { AccountStepPage } from '@/features/registration/pages/AccountStepPage'
import { NriStepPage } from '@/features/registration/pages/NriStepPage'
import { BasicStepPage } from '@/features/registration/pages/BasicStepPage'
import { RegistrationReviewPage, SectionStepPage } from '@/features/registration/pages/SectionStepPage'
import {
  isRegistrationStep,
  nextRegistrationStep,
  previousRegistrationStep,
  registrationStepMeta,
  registrationStepPath,
  registrationStepProgress,
  registrationStepsFor,
} from '@/features/registration/steps'

export function RegistrationWizardPage() {
  return (
    <RegistrationProvider>
      <RegistrationWizard />
    </RegistrationProvider>
  )
}

function RegistrationWizard() {
  const { step: rawStep } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { status, user } = useAuth()
  const { matriId, profileLocationType, setProfileLocationType } = useRegistration()

  if (status === 'unknown') {
    return <PageLoader label="Checking your account…" />
  }

  if (!isRegistrationStep(rawStep)) {
    return <Navigate to={registrationStepPath('account')} replace />
  }

  const step = rawStep
  const meta = registrationStepMeta(step)

  if (step === 'account' && status === 'authenticated') {
    if (!matriId) return <Navigate to={routes.home} replace />
    const next = nextRegistrationStep(step, profileLocationType)
    return <Navigate to={registrationStepPath(next ?? 'review')} replace />
  }

  if (status === 'authenticated' && matriId && !profileLocationType) {
    function chooseResidency(value: 'Indian Resident' | 'NRI') {
      setProfileLocationType(value)
      const target =
        value === 'NRI' ? 'nri' : step === 'nri' ? 'basic' : step
      void navigate(registrationStepPath(target), { replace: true })
    }

    return (
      <div className="registration-screen flex min-h-dvh flex-1 flex-col pt-safe pb-safe">
        <header className="sticky top-0 z-10 -mx-4 flex h-16 shrink-0 items-center bg-cream/95 px-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Link
            to={routes.home}
            aria-label="Back"
            className="-ml-2 flex size-9 items-center justify-center rounded-full text-maroon transition hover:bg-rose"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Link>
        </header>

        <div className="flex flex-1 flex-col justify-center py-8">
          <Card className="registration-section-card space-y-4 p-6">
            <Badge tone="brand">Resume registration</Badge>
            <h1 className="text-2xl text-maroon">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className="text-sm leading-relaxed text-muted">
              Your account is already created. Are you registering as an Indian
              resident or an NRI?
            </p>
            <div className="space-y-3 pt-2">
              <Button fullWidth size="lg" onClick={() => chooseResidency('Indian Resident')}>
                Indian resident
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="outline"
                onClick={() => chooseResidency('NRI')}
              >
                NRI
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const steps = registrationStepsFor(profileLocationType)

  if (!steps.includes(step)) {
    return <Navigate to={registrationStepPath('basic')} replace />
  }

  if (step !== 'account') {
    if (status === 'unauthenticated') {
      return <Navigate to={routes.login} replace state={{ from: location.pathname }} />
    }

    if (!matriId) {
      return <Navigate to={routes.home} replace />
    }
  }

  const stepIndex = steps.indexOf(step)
  const previous = previousRegistrationStep(step, profileLocationType)
  const backPath =
    step === 'account'
      ? routes.welcome
      : previous
        ? registrationStepPath(previous)
        : routes.welcome

  return (
    <div className="registration-screen flex min-h-dvh flex-1 flex-col pt-safe pb-safe">
      <header className="sticky top-0 z-10 -mx-4 flex h-16 shrink-0 items-center justify-between bg-cream/95 px-4 backdrop-blur sm:-mx-6 sm:px-6">
        <Link
          to={backPath}
          aria-label="Back"
          className="-ml-2 flex size-9 items-center justify-center rounded-full text-maroon transition hover:bg-rose"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Link>
        <span className="rounded-full bg-rose px-2.5 py-1 text-2xs font-semibold tracking-wide text-maroon">
          Step {stepIndex + 1} of {steps.length}
        </span>
      </header>

      <div className="mt-3 rounded-card border border-line bg-surface/80 px-4 py-4 shadow-soft">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
          Registration
        </p>
        <h1 className="mt-1 font-display text-2xl text-maroon">{meta.title}</h1>
        <p className="mt-1.5 text-sm text-muted">{meta.description}</p>
        <ProgressBar
          value={registrationStepProgress(step, profileLocationType)}
          label={`Registration progress: ${meta.title}`}
          className="mt-4"
        />
      </div>

      <div className="mt-5 flex flex-1 flex-col pb-6">
        {step === 'account' ? (
          <AccountStepPage />
        ) : step === 'nri' ? (
          <NriStepPage />
        ) : step === 'basic' ? (
          <BasicStepPage />
        ) : step === 'review' ? (
          <RegistrationReviewPage />
        ) : step === 'contact' || step === 'education' || step === 'family' || step === 'horoscope' || step === 'partner' ? (
          <SectionStepPage key={step} section={step} />
        ) : (
          <Card className="registration-section-card flex flex-col items-center px-6 py-10 text-center">
            <Badge tone="brand">Step {stepIndex + 1}</Badge>
            <h2 className="mt-3 text-lg text-maroon">{meta.title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              This step is not available yet. Your registration progress is saved in
              this browser for the current session.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

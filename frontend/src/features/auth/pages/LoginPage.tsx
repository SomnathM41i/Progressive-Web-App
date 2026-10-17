import { ChevronLeft, Lock, Phone } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import loginBackground from '@/assets/images/splash-background.webp'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/loading/Spinner'
import { TextField } from '@/components/ui/TextField'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { toApiError } from '@/services/api-error'

export function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    try {
      await login({ identifier, password })
      toast.success('Logged in successfully')
      void navigate(routes.home, { replace: true })
    } catch (error) {
      const apiError = toApiError(error)
      toast.error('Could not log in', { description: apiError.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex flex-1 flex-col px-6 pt-safe pb-safe">
      <img
        src={loginBackground}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />

      <header className="relative flex h-14 items-center">
        <Link
          to={routes.welcome}
          aria-label="Back"
          className="-ml-2 flex size-9 items-center justify-center rounded-full bg-white/80 text-maroon shadow-sm backdrop-blur-sm transition hover:bg-white"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Link>
      </header>

      <div className="relative flex flex-1 flex-col justify-end pt-6 pb-8">
        <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur-md">
          <h1 className="text-2xl text-maroon">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted">
            Log in to your account and find suitable matches.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Mobile number or profile ID"
              name="identifier"
              autoComplete="username"
              placeholder="e.g. SM50745 or 9096771000"
              leadingIcon={<Phone className="size-4" />}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              leadingIcon={<Lock className="size-4" />}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={submitting || !identifier.trim() || !password.trim()}
              leadingIcon={submitting ? <Spinner className="size-4" /> : undefined}
            >
              {submitting ? 'Logging in…' : 'Log in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            No account yet?{' '}
            <Link to={routes.register} className="font-semibold text-maroon">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

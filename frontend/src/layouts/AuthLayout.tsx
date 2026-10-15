import { Outlet } from 'react-router-dom'

/**
 * Shell for signed-out screens.
 *
 * No header or tab bar: the welcome and sign-in flows own the full screen and
 * carry their own brand treatment.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}

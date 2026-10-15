import { useLocation, Outlet } from 'react-router-dom'

/**
 * Shell for signed-out screens.
 *
 * No header or tab bar: the welcome and sign-in flows own the full screen and
 * carry their own brand treatment. Screens fade in on entry so stepping
 * between welcome → login → register feels like one continuous flow.
 */
export function AuthLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <div key={location.pathname} className="flex flex-1 animate-fade-in flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets the viewport to the top whenever the route changes.
 *
 * The app scrolls inside the window (no per-page scroll containers), so
 * without this a tab switch would land halfway down the previous screen — the
 * opposite of what a native app does.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

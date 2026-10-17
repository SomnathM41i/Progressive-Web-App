import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets document scrolling whenever the route changes.
 *
 * Full-screen routes own their scroll containers and remount with the keyed
 * outlet in AppLayout, which resets their internal scroll position as well.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

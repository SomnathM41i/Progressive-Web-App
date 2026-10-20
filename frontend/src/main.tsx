import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/index.css'
import { App } from '@/app/App'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { ProfilePhotoProvider } from '@/features/profiles/context/ProfilePhotoProvider'
import { ShortlistProvider } from '@/features/shortlist/context/ShortlistProvider'
import { ToastProvider } from '@/components/feedback/ToastProvider'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root not found')
}

// Log errors that React boundaries cannot catch (async work, event handlers)
// so they are visible during development instead of failing silently.
window.addEventListener('error', (event) => {
  console.error('Uncaught error', event.error ?? event.message)
})
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection', event.reason)
})

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <ProfilePhotoProvider>
            <ShortlistProvider>
              <App />
            </ShortlistProvider>
          </ProfilePhotoProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

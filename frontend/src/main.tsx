import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/index.css'
import { App } from '@/app/App'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { ShortlistProvider } from '@/features/shortlist/context/ShortlistProvider'
import { ToastProvider } from '@/components/feedback/ToastProvider'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root not found')
}

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <ShortlistProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ShortlistProvider>
    </AuthProvider>
  </StrictMode>,
)

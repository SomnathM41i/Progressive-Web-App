import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/index.css'
import { App } from '@/app/App'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { ToastProvider } from '@/components/feedback/ToastProvider'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root not found')
}

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)

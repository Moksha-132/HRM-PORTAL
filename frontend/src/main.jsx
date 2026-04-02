import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerNotificationServiceWorker } from './utils/browserNotifications'
import { applyStoredTheme } from './utils/theme'

registerNotificationServiceWorker()
applyStoredTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

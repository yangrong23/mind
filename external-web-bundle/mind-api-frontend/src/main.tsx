import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './react/mind-web.css'
import './react/mind-web-shell.css'
import { App } from './react/App'

try {
  localStorage.setItem('locale', 'en-US')
} catch {
  /* ignore */
}

const rootEl = document.getElementById('app')
if (!rootEl) {
  throw new Error('#app element not found')
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
)

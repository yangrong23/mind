import { useEffect } from 'react'
import { MindAppWeb } from '@/components/mind-v2/mind-app-web'
import { isLoggedInFromStorage } from '@/auth/session'

const DEMO_AUTH_SESSION_KEY = 'mind-v2-demo-auth'

/** Same shell as app/web/page.tsx — local design with mock KB data; API wiring stays on /platform/* */
export function WebPlatformPage() {
  useEffect(() => {
    if (isLoggedInFromStorage()) {
      sessionStorage.setItem(DEMO_AUTH_SESSION_KEY, '1')
    }
  }, [])

  return <MindAppWeb />
}

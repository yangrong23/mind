"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MindAuthScreens } from "@/components/mind-v2/mind-auth-screens"

const DEMO_AUTH_SESSION_KEY = "mind-v2-demo-auth"

export default function SignInPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DEMO_AUTH_SESSION_KEY) === "1") {
        router.replace("/")
        return
      }
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [router])

  function handleAuthenticated() {
    try {
      sessionStorage.setItem(DEMO_AUTH_SESSION_KEY, "1")
    } catch {
      /* ignore */
    }
    router.replace("/")
  }

  if (!ready) {
    return <div className="min-h-screen bg-[var(--mind-page-bg)]" aria-hidden />
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--mind-page-bg)]">
      <MindAuthScreens onAuthenticated={handleAuthenticated} />
    </div>
  )
}

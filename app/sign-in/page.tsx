"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MindAuthWeb } from "@/components/mind-v2/mind-auth-web"

const DEMO_AUTH_SESSION_KEY = "mind-v2-demo-auth"

export default function SignInPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DEMO_AUTH_SESSION_KEY) === "1") {
        router.replace("/web")
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
    router.replace("/web")
  }

  if (!ready) {
    return <div className="min-h-screen bg-[#f5f5f4]" aria-hidden />
  }

  return <MindAuthWeb onAuthenticated={handleAuthenticated} />
}

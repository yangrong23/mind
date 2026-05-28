"use client"

import { createContext, useContext, type ReactNode } from "react"
import { WebCreditsChip } from "@/components/mind-v2/web-credits-chip"

type ChromeCtx = {
  creditsRemaining: number
  onOpenCredits: () => void
  /** Inline credits control for page headers (Plaza, Me, etc.) */
  CreditsInline: () => ReactNode
}

const WebWorkspaceChromeContext = createContext<ChromeCtx | null>(null)

export function WebWorkspaceChromeProvider({
  creditsRemaining,
  onOpenCredits,
  children,
}: {
  creditsRemaining: number
  onOpenCredits: () => void
  children: ReactNode
}) {
  const value: ChromeCtx = {
    creditsRemaining,
    onOpenCredits,
    CreditsInline: () => (
      <WebCreditsChip creditsRemaining={creditsRemaining} onOpenCredits={onOpenCredits} />
    ),
  }
  return (
    <WebWorkspaceChromeContext.Provider value={value}>{children}</WebWorkspaceChromeContext.Provider>
  )
}

export function useWebWorkspaceChrome() {
  const ctx = useContext(WebWorkspaceChromeContext)
  if (!ctx) {
    throw new Error("useWebWorkspaceChrome must be used within WebWorkspaceChromeProvider")
  }
  return ctx
}

/** Optional hook — returns null outside provider (notebook sub-views). */
export function useWebWorkspaceChromeOptional() {
  return useContext(WebWorkspaceChromeContext)
}

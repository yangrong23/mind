"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ChevronLeft, Mail, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"

type AuthMode = "landing" | "sign-in" | "sign-up"

interface MindAuthScreensProps {
  onAuthenticated: () => void
  /** Close full-screen auth and return to browsing (shown on the landing step). */
  onDismiss?: () => void
}

export function MindAuthScreens({ onAuthenticated, onDismiss }: MindAuthScreensProps) {
  const [mode, setMode] = useState<AuthMode>("landing")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function finishAuth(label: string) {
    toast.success(label, { description: "Welcome to Mindar (demo)." })
    onAuthenticated()
  }

  function handleSubmitSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error("Missing fields", { description: "Enter email and password (demo)." })
      return
    }
    if (email.trim() === "root" && password === "root") {
      finishAuth("Signed in")
      return
    }
    toast.error("Invalid credentials", { description: "Demo: use account root and password root." })
  }

  function handleSubmitSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error("Missing fields", { description: "Enter email and password (demo)." })
      return
    }
    finishAuth("Account created")
  }

  if (mode === "landing") {
    return (
      <div className="relative flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 dark:bg-zinc-950">
        {onDismiss ? (
          <div className="absolute left-1 top-1 z-10">
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
              aria-label="Close"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>
        ) : null}

        <div className="flex w-full max-w-[320px] flex-col items-center text-center">
          <div
            className={cn("mb-5 flex h-16 items-center justify-center overflow-hidden px-2")}
            aria-label="Mindar"
          >
            <MindarLogo variant="auth" priority />
          </div>
          <p
            id="mind-auth-title"
            className="max-w-[280px] text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400"
          >
            Sign in to sync notes, libraries, and your copilot across devices.
          </p>

          <div className="mt-8 w-full space-y-3">
            <button
              type="button"
              onClick={() => setMode("sign-in")}
              className={cn(
                "w-full rounded-2xl py-3.5 text-[16px] font-semibold shadow-sm transition-colors active:scale-[0.99]",
                mx.brandCta
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("sign-up")}
              className={cn(
                "w-full rounded-2xl border border-zinc-200 bg-white py-3.5 text-[16px] font-semibold text-mind shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              )}
            >
              Create account
            </button>
            <p className="pt-1 text-center text-[12px] text-zinc-400 dark:text-zinc-500">
              Demo flow — no real credentials are sent.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isSignIn = mode === "sign-in"
  const title = isSignIn ? "Sign in" : "Create account"
  const subtitle = isSignIn ? "Use your Mindar account to continue." : "Set up email and password to get started."

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 dark:bg-zinc-950">
      <button
        type="button"
        onClick={() => {
          setMode("landing")
          setEmail("")
          setPassword("")
        }}
        className="absolute left-0 top-1 z-10 rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        aria-label="Back"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2} />
      </button>

      <form
        onSubmit={isSignIn ? handleSubmitSignIn : handleSubmitSignUp}
        className="flex w-full max-w-[320px] flex-col items-center"
      >
        <div className="mb-6 w-full text-center">
          <h1 id="mind-auth-title" className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          <p className="mt-1.5 text-[14px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>

        <div className="w-full space-y-4">
          <div className="text-center">
            <label htmlFor="auth-email" className="mb-1.5 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
              Account
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
              <input
                id="auth-email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/50 py-3 pl-10 pr-3 text-center text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div className="text-center">
            <label htmlFor="auth-password" className="mb-1.5 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
              <input
                id="auth-password"
                type="password"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/50 py-3 pl-10 pr-3 text-center text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col items-center gap-3">
          <button
            type="submit"
            className={cn("w-full rounded-2xl py-3.5 text-[16px] font-semibold shadow-sm transition-colors active:scale-[0.99]", mx.brandCta)}
          >
            {isSignIn ? "Sign in" : "Create account"}
          </button>
          {isSignIn ? (
            <p className="text-center text-[12px] text-zinc-500 dark:text-zinc-400">
              Demo sign-in: username and password are both{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">root</span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setMode(isSignIn ? "sign-up" : "sign-in")}
            className="text-center text-[14px] font-medium text-mind hover:text-mind/80 dark:text-mind/90"
          >
            {isSignIn ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </div>
  )
}

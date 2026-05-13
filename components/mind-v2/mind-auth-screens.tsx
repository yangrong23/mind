"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ChevronLeft, Mail, Lock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"

type AuthMode = "landing" | "sign-in" | "sign-up"

export function MindGuestWelcome({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-sky-50/90 via-white to-stone-50/90 px-6 pb-10 pt-4 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 text-center">
        <div
          className={cn(
            "mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md shadow-sky-900/10 ring-1 ring-sky-100/90 dark:bg-zinc-900 dark:ring-sky-900/40"
          )}
          aria-hidden
        >
          <Sparkles className="h-8 w-8 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Mind</h1>
        <p className="mt-2 max-w-[300px] text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          Capture, organize, and chat with your library. Sign in to sync across devices.
        </p>
      </div>

      <div className="mt-auto w-full shrink-0">
        <button
          type="button"
          onClick={onContinue}
          className={cn(
            "w-full rounded-2xl py-3.5 text-[16px] font-semibold shadow-sm transition-colors active:scale-[0.99]",
            mx.brandCta
          )}
        >
          Sign in or create account
        </button>
        <p className="mt-3 text-center text-[12px] text-zinc-400 dark:text-zinc-500">Demo — tap to open the auth flow.</p>
      </div>
    </div>
  )
}

interface MindAuthScreensProps {
  onAuthenticated: () => void
  /** When set, landing shows a back control to return to the guest welcome screen. */
  onDismissToGuest?: () => void
}

export function MindAuthScreens({ onAuthenticated, onDismissToGuest }: MindAuthScreensProps) {
  const [mode, setMode] = useState<AuthMode>("landing")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function finishAuth(label: string) {
    toast.success(label, { description: "Welcome to Mind (demo)." })
    onAuthenticated()
  }

  function handleSubmitSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error("Missing fields", { description: "Enter email and password (demo)." })
      return
    }
    finishAuth("Signed in")
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
      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col bg-gradient-to-b from-sky-50/90 via-white to-stone-50/90 px-6 pb-10 pt-6 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950"
        )}
      >
        {onDismissToGuest ? (
          <div className="absolute left-2 top-2 z-10">
            <button
              type="button"
              onClick={onDismissToGuest}
              className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-white/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>
        ) : null}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div
            className={cn(
              "mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md shadow-sky-900/10 ring-1 ring-sky-100/90 dark:bg-zinc-900 dark:ring-sky-900/40"
            )}
            aria-hidden
          >
            <Sparkles className="h-8 w-8 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Mind</h1>
          <p className="mt-2 max-w-[280px] text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            Sign in to sync notes, libraries, and your copilot across devices.
          </p>
        </div>

        <div className="mt-auto flex w-full flex-col gap-3">
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
              "w-full rounded-2xl border border-sky-200/90 bg-white py-3.5 text-[16px] font-semibold text-sky-900 shadow-sm transition-colors hover:bg-sky-50/90 dark:border-sky-800/60 dark:bg-zinc-900 dark:text-sky-100 dark:hover:bg-sky-950/50"
            )}
          >
            Create account
          </button>
          <p className="pt-2 text-center text-[12px] text-zinc-400 dark:text-zinc-500">
            Demo flow — no real credentials are sent.
          </p>
        </div>
      </div>
    )
  }

  const isSignIn = mode === "sign-in"
  const title = isSignIn ? "Sign in" : "Create account"
  const subtitle = isSignIn ? "Use your Mind account to continue." : "Set up email and password to get started."

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-stone-100/90 px-3 py-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => {
            setMode("landing")
            setEmail("")
            setPassword("")
          }}
          className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
      </div>

      <form
        onSubmit={isSignIn ? handleSubmitSignIn : handleSubmitSignUp}
        className="flex min-h-0 flex-1 flex-col px-5 pb-8 pt-6"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="mb-1.5 block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-stone-200/90 bg-stone-50/50 py-3 pl-10 pr-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div>
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
                className="w-full rounded-xl border border-stone-200/90 bg-stone-50/50 py-3 pl-10 pr-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <button
            type="submit"
            className={cn("w-full rounded-2xl py-3.5 text-[16px] font-semibold shadow-sm transition-colors active:scale-[0.99]", mx.brandCta)}
          >
            {isSignIn ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => setMode(isSignIn ? "sign-up" : "sign-in")}
            className="text-center text-[14px] font-medium text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
          >
            {isSignIn ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </div>
  )
}

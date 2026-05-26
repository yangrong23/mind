"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type MindAuthWebProps = {
  onAuthenticated: () => void
  onDismiss?: () => void
  /** When true, fills parent (overlay). When false, full viewport page. */
  embedded?: boolean
}

type AuthStep = "join" | "otp"

const OTP_LENGTH = 6

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AuthIllustrationPanel() {
  return (
    <div className="relative hidden h-full min-h-[520px] flex-1 flex-col justify-between overflow-hidden bg-[#f3f3f1] px-12 py-14 lg:flex">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden>
        <svg className="h-full w-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M320 80c40 60 20 140-30 180M60 520c80-40 120-120 100-200M280 480c-60 20-100-80-70-150"
            stroke="#1a1a1a"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <ellipse cx="200" cy="320" rx="90" ry="28" stroke="#1a1a1a" strokeWidth="1.2" />
          <circle cx="200" cy="280" r="42" stroke="#1a1a1a" strokeWidth="1.2" />
          <path d="M340 120l12-8 8 14-20-6z" fill="#4ade80" stroke="#166534" strokeWidth="0.8" />
          <path
            d="M80 100c20-30 50-40 70-20s10 50-20 60M300 500c-30 40-80 50-110 20"
            stroke="#1a1a1a"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="relative z-[1] max-w-[280px] text-[2rem] font-semibold leading-[1.15] tracking-tight text-zinc-800">
        Mind Copilot,
        <br />
        wisdom grows with your library
      </p>
      <p className="relative z-[1] text-[15px] italic text-zinc-500">
        Capture, organize, digest, share, and deliver — so every piece of knowledge creates value.
      </p>
    </div>
  )
}

function OtpInputRow({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(OTP_LENGTH, " ").slice(0, OTP_LENGTH).split("")

  const setDigit = (index: number, char: string) => {
    const arr = digits.map((d) => (d === " " ? "" : d))
    arr[index] = char
    onChange(arr.join("").replace(/\s/g, "").slice(0, OTP_LENGTH))
  }

  return (
    <div className="flex justify-center gap-2.5 sm:gap-3">
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digits[i] === " " ? "" : digits[i]}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1)
            setDigit(i, v)
            if (v && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i]?.trim() && i > 0) {
              refs.current[i - 1]?.focus()
            }
          }}
          onPaste={(e) => {
            e.preventDefault()
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
            onChange(pasted)
            const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1)
            refs.current[focusIdx]?.focus()
          }}
          className={cn(
            "h-12 w-11 rounded-xl border border-stone-200 bg-white text-center text-[18px] font-semibold tabular-nums text-zinc-900",
            "transition-[border-color,box-shadow] focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200/80 sm:h-14 sm:w-12"
          )}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  )
}

export function MindAuthWeb({ onAuthenticated, onDismiss, embedded = false }: MindAuthWebProps) {
  const [step, setStep] = useState<AuthStep>("join")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = window.setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => window.clearInterval(t)
  }, [resendCooldown])

  const finishAuth = useCallback(
    (label: string) => {
      toast.success(label, { description: "Welcome to Mindar (demo)." })
      onAuthenticated()
    },
    [onAuthenticated]
  )

  function handleGoogle() {
    toast.message("Continue with Google", { description: "Demo — opens OAuth in production." })
    finishAuth("Signed in")
  }

  function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email")
      return
    }
    setOtp("")
    setStep("otp")
    setResendCooldown(60)
    toast.message("Verification email sent", { description: `Demo code sent to ${trimmed}` })
  }

  function handleOtpContinue(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length < OTP_LENGTH) {
      toast.error("Enter the full code")
      return
    }
    finishAuth("Signed in")
  }

  function handleResend() {
    if (resendCooldown > 0) return
    setResendCooldown(60)
    toast.message("Code resent", { description: `Demo — check ${email}` })
  }

  const shell = cn(
    "flex w-full font-sans antialiased text-zinc-900",
    embedded ? "min-h-0 flex-1" : "min-h-screen"
  )

  return (
    <div className={shell}>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-10 sm:px-10",
          embedded ? "overflow-y-auto" : "min-h-screen"
        )}
      >
        <div className="w-full max-w-[420px] rounded-2xl border border-stone-200/80 bg-white px-8 py-10 text-center shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] sm:px-10 sm:py-12">
          <div className="mb-8 flex items-center justify-center">
            <MindarLogo height={36} priority className="mx-auto" />
          </div>

          {step === "join" ? (
            <>
              <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900">Join Mindar</h1>
              <p className="mx-auto mt-2 max-w-[300px] text-[14px] leading-relaxed text-zinc-500">
                Sign in to sync notes, libraries, and your copilot across the web.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleGoogle}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white py-3 text-[14px] font-medium text-zinc-800 transition-colors hover:bg-stone-50"
                >
                  <GoogleMark />
                  Continue with Google
                </button>
              </div>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-stone-200" />
                <span className="text-[13px] text-zinc-400">or</span>
                <span className="h-px flex-1 bg-stone-200" />
              </div>

              <form onSubmit={handleEmailContinue} className="mx-auto w-full max-w-[320px] space-y-4">
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-center text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200/80"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-zinc-800 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-zinc-900"
                >
                  Continue
                </button>
              </form>

              <p className="mt-6 text-center text-[12px] leading-relaxed text-zinc-400">
                By continuing, you agree to our{" "}
                <a href="#" className="underline decoration-stone-300 underline-offset-2 hover:text-zinc-600">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline decoration-stone-300 underline-offset-2 hover:text-zinc-600">
                  Privacy Policy
                </a>
                .
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900">Enter verification code</h1>
              <p className="mx-auto mt-2 max-w-[300px] text-[14px] leading-relaxed text-zinc-500">
                We sent an email to{" "}
                <span className="font-medium text-zinc-700">{email}</span>
              </p>

              <form onSubmit={handleOtpContinue} className="mx-auto mt-8 w-full max-w-[320px]">
                <OtpInputRow value={otp} onChange={setOtp} />
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className={cn(
                    "mx-auto mt-5 block text-[13px] font-medium transition-colors",
                    resendCooldown > 0 ? "text-zinc-300" : "text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                </button>

                <div className="mt-10 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("join")
                      setOtp("")
                    }}
                    className="flex-1 rounded-xl border border-stone-200 bg-white py-3 text-[15px] font-semibold text-zinc-700 transition-colors hover:bg-stone-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-zinc-800 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-zinc-900 disabled:opacity-50"
                    disabled={otp.length < OTP_LENGTH}
                  >
                    Continue
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center text-[11px] text-zinc-400">
                Demo: enter any {OTP_LENGTH}-digit code. Dev bypass: email{" "}
                <span className="font-medium">root@mindar.dev</span> with code{" "}
                <span className="font-medium">000000</span>.
              </p>
            </>
          )}

          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="mt-8 w-full text-center text-[13px] font-medium text-zinc-500 hover:text-zinc-700"
            >
              Browse without signing in
            </button>
          ) : (
            <p className="mt-8 text-center text-[13px] text-zinc-500">
              <Link href="/web" className="font-medium text-zinc-700 hover:text-zinc-900">
                Back to app
              </Link>
              <span className="mx-2 text-zinc-300">·</span>
              <Link href="/landing" className="font-medium text-zinc-700 hover:text-zinc-900">
                Home
              </Link>
            </p>
          )}
        </div>
      </div>

      <AuthIllustrationPanel />
    </div>
  )
}

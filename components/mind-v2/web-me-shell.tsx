"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import {
  ChevronRight,
  Crown,
  FileText,
  Flame,
  Sparkles,
} from "lucide-react"
import type { MindAccount } from "@/lib/mind-accounts"

export type WebMeStat = {
  label: string
  value: string | number
  icon: LucideIcon
  tone: "blue" | "orange" | "violet" | "teal"
}

const STAT_TONE: Record<WebMeStat["tone"], string> = {
  blue: "bg-white/70 text-mind ring-1 ring-white/80",
  orange: "bg-white/70 text-zinc-600 ring-1 ring-white/80",
  violet: "bg-white/70 text-zinc-600 ring-1 ring-white/80",
  teal: "bg-white/70 text-mind ring-1 ring-white/80",
}

export function WebMeUpgradeBanner({
  creditsRemaining,
  creditsMonthlyAllowance,
  planName = "Standard",
  onUpgrade,
  className,
}: {
  creditsRemaining: number
  creditsMonthlyAllowance: number
  planName?: string
  onUpgrade: () => void
  className?: string
}) {
  const pct = Math.min(100, Math.round((creditsRemaining / creditsMonthlyAllowance) * 100))

  return (
    <button
      type="button"
      onClick={onUpgrade}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl p-[1px] text-left transition-transform",
        "bg-gradient-to-br from-violet-500 via-mind to-sky-400 shadow-lg shadow-mind/15",
        "hover:scale-[1.01] active:scale-[0.99]",
        webNavMotion.pressable,
        className
      )}
      aria-label="View plans and upgrade"
    >
      <span
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/25 blur-2xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-violet-300/30 blur-2xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-3 rounded-[15px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0c4a6e] px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Crown className="h-5 w-5 text-amber-300" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-200/90">
              {planName} plan
            </p>
            <p className="mt-0.5 text-[17px] font-semibold tracking-tight text-white">
              Upgrade for more credits
            </p>
            <p className="mt-1 text-[13px] leading-snug text-sky-100/75">
              <span className="font-semibold tabular-nums text-white">
                {creditsRemaining.toLocaleString("en-US")}
              </span>{" "}
              credits left · unlock Pro models & Studio
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:min-w-[148px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-sky-300 to-white"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-[13px] font-bold text-zinc-900 shadow-sm">
            Compare plans
            <ChevronRight className="h-4 w-4 text-mind" strokeWidth={2.5} aria-hidden />
          </span>
        </div>
      </div>
    </button>
  )
}

export function WebMeProfileHeader({
  account,
  stats,
  creditsRemaining,
  creditsMonthlyAllowance,
  planName,
  onOpenAccountSwitcher,
  onOpenCredits,
}: {
  account: MindAccount
  stats: WebMeStat[]
  creditsRemaining: number
  creditsMonthlyAllowance: number
  planName?: string
  onOpenAccountSwitcher: () => void
  onOpenCredits: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={onOpenAccountSwitcher}
          className={cn(
            "group flex min-w-0 items-center gap-4 rounded-2xl text-left transition-colors",
            "hover:bg-white/40",
            webNavMotion.pressable
          )}
          aria-label="Switch account"
        >
          <div
            className={cn(
              "flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white",
              account.kind === "work"
                ? "bg-gradient-to-br from-mind to-[color-mix(in_oklch,var(--mind-blue)_70%,#38bdf8)] shadow-sm"
                : "bg-gradient-to-br from-[color-mix(in_oklch,var(--mind-blue)_85%,#2dd4bf)] to-mind shadow-sm"
            )}
          >
            {account.initial}
          </div>
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900">{account.displayName}</h1>
            <p className="mt-0.5 text-[14px] text-zinc-500">{account.email}</p>
          </div>
        </button>

        <div className="flex flex-wrap gap-5 sm:gap-6">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    STAT_TONE[s.tone]
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[18px] font-semibold tabular-nums leading-none text-zinc-900">
                    {typeof s.value === "number" ? s.value.toLocaleString("en-US") : s.value}
                  </p>
                  <p className="mt-1 text-[12px] text-zinc-500">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <WebMeUpgradeBanner
        creditsRemaining={creditsRemaining}
        creditsMonthlyAllowance={creditsMonthlyAllowance}
        planName={planName}
        onUpgrade={onOpenCredits}
      />
    </div>
  )
}

export function WebMeSettingCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
  toggle,
  checked,
  onToggle,
  expanded,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  onClick?: () => void
  toggle?: boolean
  checked?: boolean
  onToggle?: () => void
  expanded?: boolean
  children?: ReactNode
  className?: string
}) {
  const header = (
    <div className="flex min-w-0 flex-1 items-center gap-3.5">
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", web.sectionIconWell)}>
        <Icon className="h-5 w-5 text-mind" strokeWidth={1.85} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-zinc-900">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-[13px] text-zinc-500">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )

  return (
    <article
      className={cn(
        cn(web.surfaceCardFlat, "overflow-hidden transition-colors duration-300"),
        className
      )}
    >
      {toggle ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          {header}
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onToggle}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200",
              checked ? "bg-sky-500" : "bg-stone-200"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-200 ease-out",
                checked && "translate-x-5"
              )}
            />
          </button>
        </div>
      ) : onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-stone-50/70",
            webNavMotion.pressable
          )}
        >
          {header}
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" />
        </button>
      ) : (
        <div
          className="px-4 py-3.5"
        >
          {header}
        </div>
      )}
      {children ? (
        <div className="border-t border-stone-100/80 px-3 pb-3 pt-1">{children}</div>
      ) : null}
    </article>
  )
}

export const WEB_ME_DEFAULT_STATS: WebMeStat[] = [
  { label: "Notes", value: 156, icon: FileText, tone: "blue" },
  { label: "Streak", value: 7, icon: Flame, tone: "orange" },
]

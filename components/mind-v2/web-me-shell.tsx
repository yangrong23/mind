"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import {
  ChevronRight,
  Clock,
  FileText,
  Flame,
  Sparkles,
  Wallet,
} from "lucide-react"
import type { MindAccount } from "@/lib/mind-accounts"

export type WebMeStat = {
  label: string
  value: string | number
  icon: LucideIcon
  tone: "blue" | "orange" | "violet" | "teal"
}

const STAT_TONE: Record<WebMeStat["tone"], string> = {
  blue: "bg-sky-50 text-mind",
  orange: "bg-orange-50 text-orange-600",
  violet: "bg-blue-50 text-blue-600",
  teal: "bg-sky-50/80 text-mind",
}

export function WebMeProfileHeader({
  account,
  stats,
  onOpenAccountSwitcher,
  onOpenCredits,
}: {
  account: MindAccount
  stats: WebMeStat[]
  onOpenAccountSwitcher: () => void
  onOpenCredits: () => void
}) {
  return (
    <div
      className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
    >
      <button
        type="button"
        onClick={onOpenAccountSwitcher}
        className={cn(
          "group flex min-w-0 items-center gap-4 rounded-2xl text-left transition-colors",
          "hover:bg-stone-50/80",
          webNavMotion.pressable
        )}
        aria-label="Switch account"
      >
        <div
          className={cn(
            "flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white",
            account.kind === "work"
              ? "bg-gradient-to-br from-blue-600 to-sky-500 shadow-sm shadow-sky-300/35"
              : "bg-gradient-to-br from-sky-500 to-cyan-400 shadow-sm shadow-sky-200/35"
          )}
        >
          {account.initial}
        </div>
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900">{account.displayName}</h1>
          <p className="mt-0.5 text-[14px] text-zinc-500">{account.email}</p>
        </div>
      </button>

      <div className="flex flex-wrap items-end gap-4 lg:gap-6">
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

        <button
          type="button"
          onClick={onOpenCredits}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl bg-mind px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm shadow-sky-300/35 transition-colors hover:bg-sky-600",
            webNavMotion.pressable
          )}
        >
          <Wallet className="h-4 w-4" strokeWidth={2} />
          Plans & refill
          <ChevronRight className="h-4 w-4 opacity-80" />
        </button>
      </div>
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
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50/90">
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
        "overflow-hidden rounded-2xl bg-white transition-colors duration-300",
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
  { label: "Memos", value: 156, icon: FileText, tone: "blue" },
  { label: "Streak", value: 7, icon: Flame, tone: "orange" },
  { label: "Captured", value: "12.5h", icon: Clock, tone: "violet" },
  { label: "Credits", value: "32,400", icon: Sparkles, tone: "teal" },
]

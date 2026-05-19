"use client"
import type { ReactNode } from "react"

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"

export function SettingsScreenShell({
  title,
  onBack,
  children,
  zClass = "z-[51]",
}: {
  title: string
  onBack: () => void
  children: ReactNode
  zClass?: string
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col bg-white animate-in slide-in-from-right duration-200 dark:bg-zinc-950",
        zClass
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-stone-100/85 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-1 hover:bg-stone-100 dark:hover:bg-zinc-800"
          aria-label="Back"
        >
          <ChevronRight className="h-6 w-6 rotate-180 text-zinc-600 dark:text-zinc-300" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        <div className="w-8 shrink-0" aria-hidden />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-8">{children}</div>
    </div>
  )
}

export function SettingsGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-stone-100/90 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SettingsLinkRow({
  label,
  value,
  onClick,
  last,
}: {
  label: string
  value?: string
  onClick?: () => void
  last?: boolean
}) {
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors",
        onClick && "hover:bg-stone-50 active:bg-stone-100/80 dark:hover:bg-zinc-800/50",
        !last && "border-b border-stone-100/90 dark:border-zinc-800"
      )}
    >
      <span className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
      <div className="flex min-w-0 shrink-0 items-center gap-1">
        {value ? (
          <span className="max-w-[9rem] truncate text-[14px] tabular-nums text-zinc-500 dark:text-zinc-400">
            {value}
          </span>
        ) : null}
        {onClick ? <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" /> : null}
      </div>
    </Comp>
  )
}

export function SettingsToggleRow({
  label,
  checked,
  onChange,
  last,
}: {
  label: string
  checked: boolean
  onChange: () => void
  last?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3.5",
        !last && "border-b border-stone-100/90 dark:border-zinc-800"
      )}
    >
      <span className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors",
          checked ? "bg-mind" : mx.toggleTrackOff
        )}
      >
        <span
          className={cn(
            "block h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  )
}

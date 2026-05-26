"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { getMindAccount, type MindAccountId } from "@/lib/mind-accounts"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { Compass, Layers, NotebookPen, Settings, Sparkles, Zap } from "lucide-react"
import type { WebTabType } from "@/components/mind-v2/web-sidebar-nav"

const tabs: { id: WebTabType; label: string; icon: LucideIcon }[] = [
  { id: "plaza", label: "Square", icon: Compass },
  { id: "library", label: "Library", icon: Layers },
  { id: "notes", label: "Notes", icon: NotebookPen },
  { id: "agent", label: "Agent", icon: Sparkles },
]

const railItemClass = (active?: boolean) =>
  cn(
    "flex w-full flex-col items-center gap-1.5 rounded-xl py-2.5 transition-colors",
    active ? "text-zinc-800" : "text-zinc-500 hover:bg-white/80 hover:text-zinc-600",
    webNavMotion.pressable
  )

function RailIconCircle({
  active,
  children,
}: {
  active?: boolean
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        active ? "bg-gradient-to-br from-teal-100 to-violet-100" : "bg-transparent"
      )}
    >
      {children}
    </span>
  )
}

function WebIconRailItem({
  active,
  onClick,
  title,
  icon: Icon,
  label,
  iconStroke = 1.75,
  subtitle,
}: {
  active?: boolean
  onClick?: () => void
  title: string
  icon: LucideIcon
  label: ReactNode
  iconStroke?: number
  subtitle?: string
}) {
  return (
    <button type="button" onClick={onClick} title={title} className={railItemClass(active)}>
      <RailIconCircle active={active}>
        <Icon className="h-5 w-5 text-teal-600" strokeWidth={active ? 2.25 : iconStroke} />
      </RailIconCircle>
      <span
        className={cn(
          "text-center text-[11px] font-semibold leading-tight",
          active ? "text-teal-800/90" : "text-zinc-600"
        )}
      >
        {label}
      </span>
      {subtitle ? (
        <span className="text-[10px] font-medium tabular-nums leading-none text-zinc-400">{subtitle}</span>
      ) : null}
    </button>
  )
}

export function WebIconRail({
  activeTab,
  onTabChange,
  activeAccountId = "work",
  creditsRemaining = 32_400,
  onOpenCredits,
  onOpenSettings,
  settingsActive = false,
}: {
  activeTab: WebTabType
  onTabChange: (tab: WebTabType) => void
  activeAccountId?: MindAccountId
  creditsRemaining?: number
  creditsMonthlyAllowance?: number
  onOpenCredits?: () => void
  onOpenSettings?: () => void
  settingsActive?: boolean
}) {
  const account = getMindAccount(activeAccountId)

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col items-stretch px-2.5",
        "pt-2 pb-[max(14px,calc(env(safe-area-inset-bottom,0px)+20px))]",
        web.railWidth,
        web.canvas
      )}
      aria-label="Main navigation"
    >
      <button
        type="button"
        onClick={() => onTabChange("me")}
        title={`${account.displayName} — Me`}
        aria-label={`Open Me — ${account.displayName}`}
        className={cn(
          "mx-auto mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-teal-400 text-sm font-bold text-white shadow-sm",
          webNavMotion.pressable,
          activeTab === "me" && "ring-2 ring-white/90"
        )}
      >
        {account.initial}
      </button>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain">
        {tabs.map((item) => {
          const active = activeTab === item.id
          return (
            <div key={item.id}>
              <WebIconRailItem
                active={active}
                onClick={() => onTabChange(item.id)}
                title={item.label}
                icon={item.icon}
                label={item.label}
              />
              {item.id === "agent" ? (
                <WebIconRailItem
                  onClick={onOpenCredits}
                  title="Credits"
                  icon={Zap}
                  label="Credits"
                  subtitle={creditsRemaining.toLocaleString("en-US")}
                  iconStroke={2}
                />
              ) : null}
            </div>
          )
        })}
      </nav>

      <div className="mt-2 shrink-0 space-y-1 border-t border-stone-200/60 pt-2.5 dark:border-zinc-700/60">
        <WebIconRailItem
          active={settingsActive}
          onClick={onOpenSettings}
          title="Settings"
          icon={Settings}
          label="Settings"
        />

        <Link
          href="/landing"
          className={cn(railItemClass(false), "flex flex-col items-center py-2.5")}
          title="Mindar"
          aria-label="Go to Mindar home"
        >
          <MindarLogo height={28} className="mx-auto max-w-[5.25rem] object-center opacity-95" />
        </Link>
      </div>
    </aside>
  )
}

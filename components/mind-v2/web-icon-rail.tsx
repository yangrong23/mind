"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { getMindAccount, type MindAccountId } from "@/lib/mind-accounts"
import { MindarLogoMark } from "@/components/mind-v2/mindar-logo"
import { Compass, Layers, NotebookPen, Settings, Sparkles, Zap } from "lucide-react"
import type { WebTabType } from "@/components/mind-v2/web-sidebar-nav"

const tabs: { id: WebTabType; label: string; icon: LucideIcon }[] = [
  { id: "plaza", label: "Square", icon: Compass },
  { id: "library", label: "Library", icon: Layers },
  { id: "memos", label: "Memos", icon: NotebookPen },
  { id: "agent", label: "Agent", icon: Sparkles },
]

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
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        web.railTabBase,
        active ? web.railTabActive : web.railTabIdle,
        "focus-visible:outline-none focus-visible:ring-0",
        webNavMotion.pressable
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl transition-[background-color,box-shadow] duration-200",
          active && web.railTabActiveWell
        )}
      >
        <Icon
          className={cn("h-5 w-5", active ? web.navItemActiveIcon : "text-zinc-500")}
          strokeWidth={active ? 2.25 : iconStroke}
        />
      </span>
      <span
        className={cn(
          "text-center text-[11px] font-semibold leading-tight tracking-tight",
          active ? web.navSelectionText : "text-zinc-500"
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
        /* Less top padding + extra bottom inset so wordmark isn’t flush with screen corner */
        "pt-2 pb-[max(14px,calc(env(safe-area-inset-bottom,0px)+20px))]",
        web.railWidth,
        web.railSurface
      )}
      aria-label="Main navigation"
    >
      <button
        type="button"
        onClick={() => onTabChange("me")}
        title={`${account.displayName} — Me`}
        aria-label={`Open Me — ${account.displayName}`}
        className={cn(
          "mx-auto mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          "bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500 text-sm font-bold text-white shadow-sm shadow-sky-300/40",
          "focus-visible:outline-none focus-visible:ring-0",
          webNavMotion.pressable,
          activeTab === "me" ? "opacity-100" : "opacity-90 hover:opacity-100"
        )}
      >
        {account.initial}
      </button>

      <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain">
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

      <div className="mt-2 shrink-0 space-y-1.5 border-t border-sky-100/40 pt-2.5">
        <WebIconRailItem
          active={settingsActive}
          onClick={onOpenSettings}
          title="Settings"
          icon={Settings}
          label="Settings"
        />

        <Link
          href="/landing"
          className={cn(
            web.railTabBase,
            web.railTabIdle,
            webNavMotion.pressable,
            "flex flex-col items-center py-2.5 focus-visible:outline-none focus-visible:ring-0"
          )}
          title="Mindar"
          aria-label="Go to Mindar home"
        >
          <MindarLogoMark size={32} className="mx-auto max-w-[5.25rem] opacity-95" />
        </Link>
      </div>
    </aside>
  )
}

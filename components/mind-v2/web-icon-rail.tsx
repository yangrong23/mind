"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { getMindAccount, type MindAccountId } from "@/lib/mind-accounts"
import { MindarLogoMark } from "@/components/mind-v2/mindar-logo"
import { Compass, Layers, NotebookPen, Settings, Sparkles } from "lucide-react"
import type { WebTabType } from "@/components/mind-v2/web-sidebar-nav"

/** High-frequency first: Agent → Library → discover → Memos */
const tabs: { id: WebTabType; label: string; icon: LucideIcon }[] = [
  { id: "agent", label: "Agent", icon: Sparkles },
  { id: "library", label: "Library", icon: Layers },
  { id: "plaza", label: "Square", icon: Compass },
  { id: "memos", label: "Notes", icon: NotebookPen },
]

function WebIconRailItem({
  active,
  onClick,
  title,
  icon: Icon,
  label,
  iconStroke = 1.75,
}: {
  active?: boolean
  onClick?: () => void
  title: string
  icon: LucideIcon
  label: ReactNode
  iconStroke?: number
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
    </button>
  )
}

export function WebIconRail({
  activeTab,
  onTabChange,
  activeAccountId = "work",
  onOpenSettings,
  settingsActive = false,
}: {
  activeTab: WebTabType
  onTabChange: (tab: WebTabType) => void
  activeAccountId?: MindAccountId
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
        web.railSurface
      )}
      aria-label="Main navigation"
    >
      <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain pt-1">
        {tabs.map((item) => {
          const active = activeTab === item.id
          return (
            <WebIconRailItem
              key={item.id}
              active={active}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              icon={item.icon}
              label={item.label}
            />
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

        <button
          type="button"
          onClick={() => onTabChange("me")}
          title={`${account.displayName} — Me`}
          aria-label={`Open Me — ${account.displayName}`}
          className={cn(
            web.railTabBase,
            activeTab === "me" ? web.railTabActive : web.railTabIdle,
            "focus-visible:outline-none focus-visible:ring-0",
            webNavMotion.pressable
          )}
        >
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm transition-[background-color,box-shadow] duration-200",
              "bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500 shadow-sky-300/40",
              activeTab === "me" && web.railTabActiveWell
            )}
          >
            {account.initial}
          </span>
          <span
            className={cn(
              "text-center text-[11px] font-semibold leading-tight tracking-tight",
              activeTab === "me" ? web.navSelectionText : "text-zinc-500"
            )}
          >
            Me
          </span>
        </button>

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

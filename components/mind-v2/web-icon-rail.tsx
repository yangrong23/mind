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

/** Plaza discover first; Library / Agent / Notes match recents sidebar order. */
const tabs: { id: WebTabType; label: string; icon: LucideIcon; title?: string }[] = [
  { id: "plaza", label: "Plaza", icon: Compass },
  { id: "library", label: "Library", icon: Layers },
  { id: "agent", label: "Mindar", icon: Sparkles },
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
          "flex h-8 w-8 items-center justify-center rounded-lg transition-[background-color,box-shadow] duration-200",
          active ? web.railTabActiveWell : web.sectionIconWell
        )}
      >
        <Icon
          className={cn("h-[18px] w-[18px]", active ? web.navItemActiveIcon : "text-zinc-500")}
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
              title={item.title ?? item.label}
              icon={item.icon}
              label={item.label}
            />
          )
        })}
      </nav>

      <div className="mt-2 shrink-0 space-y-1.5 pt-1">
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
              "bg-mind shadow-[0_4px_14px_-4px_color-mix(in_oklch,var(--mind-blue)_35%,transparent)]",
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
          <MindarLogoMark size={44} className="mx-auto max-w-[6.75rem] opacity-95" />
        </Link>
      </div>
    </aside>
  )
}

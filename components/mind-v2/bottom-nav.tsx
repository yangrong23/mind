"use client"

import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { FileText, Layers, Sparkles, User } from "lucide-react"

export type TabType = "notes" | "knowledge" | "agent" | "me"

interface BottomNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs = [
  { id: "notes" as TabType, label: "Notes", icon: FileText },
  { id: "knowledge" as TabType, label: "Knowledge", icon: Layers },
  { id: "agent" as TabType, label: "Minder", icon: Sparkles },
  { id: "me" as TabType, label: "Me", icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className={cn(
        "flex w-full items-center justify-around overflow-visible pb-[max(6px,env(safe-area-inset-bottom))] pt-1",
        mx.navDockShell
      )}
      aria-label="Main"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 overflow-visible px-1 py-1.5",
              mx.navEase,
              "transition-[transform,opacity]",
              isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
            )}
          >
            {/* Active: soft radial bloom + icon luminance — no flat pill */}
            <div
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-2xl",
                mx.navEase,
                isActive ? "scale-110" : "scale-100"
              )}
            >
              {isActive ? (
                <>
                  <span className={mx.navBloomOuter} aria-hidden />
                  <span className={mx.navBloomInner} aria-hidden />
                </>
              ) : null}
              <Icon
                className={cn(
                  "relative z-[1] h-[19px] w-[19px] transition-[transform,filter,color]",
                  mx.navEase,
                  isActive ? cn("scale-105", mx.navIconGlow) : "text-zinc-400 dark:text-zinc-500"
                )}
                strokeWidth={isActive ? 2.1 : 1.65}
              />
            </div>
            <span
              className={cn(
                "max-w-[4rem] truncate text-[9px] font-medium tracking-tight transition-colors duration-300",
                isActive
                  ? "font-semibold text-mind/95 dark:text-mind/95"
                  : "text-zinc-400 dark:text-zinc-500"
              )}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

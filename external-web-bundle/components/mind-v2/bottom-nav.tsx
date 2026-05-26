"use client"

import { cn } from "@/lib/utils"
import { FileText, Layers, Sparkles, User } from "lucide-react"

export type TabType = "notes" | "knowledge" | "agent" | "me"

interface BottomNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs = [
  { id: "notes" as TabType, label: "Notes", icon: FileText },
  { id: "knowledge" as TabType, label: "Knowledge", icon: Layers },
  { id: "agent" as TabType, label: "Mindar", icon: Sparkles },
  { id: "me" as TabType, label: "Me", icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="pointer-events-none flex justify-center overflow-visible px-2 pb-2 pt-0">
      <nav
        className={cn(
          "pointer-events-auto flex w-full items-center justify-around overflow-visible py-1.5",
          "border-t border-[#e5e3df] bg-white/98 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/98"
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
                "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1.5",
                "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "transition-opacity",
                isActive ? "opacity-100" : "opacity-80"
              )}
            >
              <div
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-lg",
                  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isActive ? "rounded-lg bg-[#1a1a1a] dark:bg-zinc-100" : "bg-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "relative z-[1] h-[19px] w-[19px] transition-colors",
                    "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isActive ? "text-white dark:text-[#1a1a1a]" : "text-[#787671] dark:text-zinc-500"
                  )}
                  strokeWidth={isActive ? 2.1 : 1.65}
                />
              </div>
              <span
                className={cn(
                  "max-w-[4rem] truncate text-[10px] font-medium tracking-tight",
                  isActive ? "font-semibold text-[#1a1a1a] dark:text-zinc-100" : "text-[#787671] dark:text-zinc-500"
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

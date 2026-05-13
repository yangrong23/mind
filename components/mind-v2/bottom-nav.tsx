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
  { id: "agent" as TabType, label: "Minder", icon: Sparkles },
  { id: "me" as TabType, label: "Me", icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="pointer-events-none flex justify-center overflow-visible px-3 pb-2 pt-1">
      <nav
        className="pointer-events-auto flex w-full items-center justify-around overflow-visible rounded-[1.35rem] bg-white/65 py-1.5 shadow-[0_-6px_28px_-10px_rgba(15,23,42,0.1),0_8px_28px_-14px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:bg-zinc-900/55 dark:shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.35)]"
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
                "transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
              )}
            >
              {/* Active: soft radial bloom + icon luminance — no flat pill */}
              <div
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isActive ? "scale-110" : "scale-100"
                )}
              >
                {isActive ? (
                  <>
                    <span
                      className="pointer-events-none absolute -inset-[10px] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.26)_0%,rgba(125,211,252,0.1)_38%,transparent_68%)] opacity-100 dark:bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.2)_0%,rgba(14,165,233,0.08)_40%,transparent_70%)]"
                      aria-hidden
                    />
                    <span
                      className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(ellipse_100%_95%_at_50%_8%,rgba(255,255,255,0.92)_0%,rgba(186,230,253,0.42)_32%,rgba(125,211,252,0.14)_58%,transparent_78%)] dark:bg-[radial-gradient(ellipse_100%_95%_at_50%_12%,rgba(56,189,248,0.32)_0%,rgba(14,165,233,0.12)_45%,transparent_74%)]"
                      aria-hidden
                    />
                  </>
                ) : null}
                <Icon
                  className={cn(
                    "relative z-[1] h-[19px] w-[19px] transition-[transform,filter,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isActive
                      ? "scale-105 text-sky-600 drop-shadow-[0_0_10px_rgba(56,189,248,0.55),0_0_22px_rgba(125,211,252,0.35)] dark:text-sky-200 dark:drop-shadow-[0_0_12px_rgba(56,189,248,0.45),0_0_28px_rgba(14,165,233,0.2)]"
                      : "text-zinc-400 dark:text-zinc-500"
                  )}
                  strokeWidth={isActive ? 2.1 : 1.65}
                />
              </div>
              <span
                className={cn(
                  "max-w-[4rem] truncate text-[9px] font-medium tracking-tight transition-colors duration-300",
                  isActive
                    ? "font-semibold text-sky-900/95 dark:text-sky-100/95"
                    : "text-zinc-400 dark:text-zinc-500"
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

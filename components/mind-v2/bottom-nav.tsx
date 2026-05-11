"use client"

import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { FileText, Layers, Sparkles, User } from "lucide-react"

export type TabType = "notes" | "knowledge" | "agent" | "me"

interface BottomNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

/** Tab labels: Notes (captures + rich text, archivable) · Knowledge · Minder · Me */
const tabs = [
  { id: "notes" as TabType, label: "Notes", icon: FileText },
  { id: "knowledge" as TabType, label: "Knowledge", icon: Layers },
  { id: "agent" as TabType, label: "Minder", icon: Sparkles },
  { id: "me" as TabType, label: "Me", icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="flex items-center justify-around py-2 pb-1 bg-white/95 backdrop-blur-xl border-t border-gray-100">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-1 flex-col items-center gap-0.5 px-1 py-1.5 transition-all"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                isActive ? mx.navActiveWell : "bg-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-[20px] h-[20px] transition-all",
                  isActive ? mx.navActiveIcon : "text-gray-400"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px] transition-all max-w-[4.5rem] truncate",
                isActive ? cn(mx.navActiveLabel, "font-semibold") : "text-gray-400 font-medium"
              )}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

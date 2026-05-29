"use client"

import { ChevronRight, Settings, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"

/** Prominent Me settings entry — account, devices, display, privacy. */
export function WebMeSettingsEntry({
  onOpenSettings,
  className,
}: {
  onOpenSettings: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onOpenSettings}
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl border border-white/90 bg-white/85 p-4 text-left shadow-[0_8px_28px_-14px_rgba(15,23,42,0.1)] ring-1 ring-mind/10 transition-[box-shadow,transform]",
        "hover:border-mind/25 hover:bg-white hover:shadow-[0_12px_36px_-14px_rgba(15,23,42,0.12)]",
        webNavMotion.pressable,
        className
      )}
      aria-label="Open settings"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mind/15 to-sky-500/10 ring-1 ring-mind/20">
        <Settings className="h-5 w-5 text-mind" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[16px] font-semibold text-zinc-900">
          Settings
          <SlidersHorizontal className="h-4 w-4 text-zinc-400" strokeWidth={2} aria-hidden />
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-zinc-500">
          Account, devices, display, privacy & billing
        </span>
      </span>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-mind"
        strokeWidth={2.25}
        aria-hidden
      />
    </button>
  )
}

"use client"

import type { ReactNode } from "react"
import { ChevronLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"

/** Desktop Me — settings drill-down as a right sheet (not mobile full-screen push) */
export function WebMeSettingsDetail({
  title,
  onBack,
  children,
}: {
  title: string
  onBack: () => void
  children: ReactNode
}) {
  return (
    <div className="absolute inset-0 z-[55] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onBack}
      />
      <aside
        role="dialog"
        aria-modal
        aria-labelledby="web-me-settings-title"
        className={cn(
          "relative z-10 flex h-full w-full max-w-[min(440px,92vw)] flex-col",
          "border-l border-stone-200/90 bg-white shadow-[-8px_0_32px_rgba(15,23,42,0.08)]",
          "animate-in slide-in-from-right duration-200"
        )}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-stone-100 px-5 py-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-stone-100"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 id="web-me-settings-title" className="min-w-0 flex-1 text-[17px] font-semibold text-zinc-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg p-2 text-zinc-400 hover:bg-stone-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className={cn("scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-5", web.softType)}>
          {children}
        </div>
      </aside>
    </div>
  )
}

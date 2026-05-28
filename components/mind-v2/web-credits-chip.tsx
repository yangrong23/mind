"use client"

import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { Sparkles } from "lucide-react"

/** Compact credits entry — pairs with page titles in the same row or floats top-right. */
export function WebCreditsChip({
  creditsRemaining,
  onOpenCredits,
  className,
  size = "default",
}: {
  creditsRemaining: number
  onOpenCredits: () => void
  className?: string
  size?: "default" | "compact"
}) {
  return (
    <button
      type="button"
      onClick={onOpenCredits}
      className={cn(web.creditsPill, size === "compact" && "px-2.5 py-1 text-[11px]", className)}
      aria-label="Open credits and plans"
    >
      <span className={cn("flex items-center justify-center rounded-full bg-mind/12", size === "compact" ? "h-6 w-6" : "h-7 w-7")}>
        <Sparkles className={cn("text-mind", size === "compact" ? "h-3 w-3" : "h-3.5 w-3.5")} strokeWidth={2.25} aria-hidden />
      </span>
      <span className="tabular-nums text-zinc-800">{creditsRemaining.toLocaleString("en-US")}</span>
      <span className="hidden font-medium text-zinc-500 sm:inline">credits</span>
    </button>
  )
}

"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Zap } from "lucide-react"

/** Top bar for shell views — credits live top-right per product IA. */
export function WebShellHeader({
  title,
  subtitle,
  creditsRemaining,
  onOpenCredits,
  trailing,
  className,
}: {
  title?: string
  subtitle?: string
  creditsRemaining: number
  onOpenCredits: () => void
  trailing?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 border-b border-black/[0.04] bg-white/60 px-5 py-2.5 backdrop-blur-sm",
        className
      )}
    >
      <div className="min-w-0">
        {title ? (
          <h1 className="truncate text-[15px] font-semibold text-zinc-800">{title}</h1>
        ) : null}
        {subtitle ? <p className="truncate text-[12px] text-zinc-500">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        <button
          type="button"
          onClick={onOpenCredits}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 text-[12px] font-semibold text-amber-900 ring-1 ring-amber-200/80 hover:from-amber-100 hover:to-yellow-100"
          aria-label="Open credits"
        >
          <Zap className="h-3.5 w-3.5 text-amber-600" strokeWidth={2.25} aria-hidden />
          <span className="tabular-nums">{creditsRemaining.toLocaleString("en-US")}</span>
          <span className="font-medium text-amber-700/80">credits</span>
        </button>
      </div>
    </header>
  )
}

"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
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
        "flex shrink-0 items-center justify-between gap-3 px-6 py-3",
        web.shellHeader,
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
          className={web.creditsPill}
          aria-label="Open credits"
        >
          <Zap className="h-3.5 w-3.5 text-mind" strokeWidth={2.25} aria-hidden />
          <span className="tabular-nums">{creditsRemaining.toLocaleString("en-US")}</span>
          <span className="font-medium text-zinc-500">credits</span>
        </button>
      </div>
    </header>
  )
}

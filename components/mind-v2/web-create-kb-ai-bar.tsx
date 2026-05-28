"use client"

import { Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function WebCreateKbAiBar({
  label,
  hint,
  loading,
  disabled,
  onClick,
  variant = "primary",
}: {
  label: string
  hint?: string
  loading?: boolean
  disabled?: boolean
  onClick: () => void
  variant?: "primary" | "subtle"
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5",
        variant === "primary"
          ? "border-mind/20 bg-gradient-to-r from-mind/[0.06] to-violet-500/[0.04]"
          : "border-stone-200/90 bg-stone-50/60"
      )}
    >
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-zinc-800">{label}</p>
        {hint ? <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{hint}</p> : null}
      </div>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onClick}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
          disabled || loading
            ? "cursor-not-allowed bg-stone-100 text-zinc-400"
            : "bg-mind text-white hover:bg-mind/90"
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
        )}
        {loading ? "Generating…" : "Generate"}
      </button>
    </div>
  )
}

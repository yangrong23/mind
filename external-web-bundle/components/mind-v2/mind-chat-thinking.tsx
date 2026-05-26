"use client"

import { cn } from "@/lib/utils"

const PHASE_LABELS = [
  { title: "Understanding your request", sub: "Analyzing context and sources…" },
  { title: "Processing", sub: "Searching libraries and notes…" },
  { title: "Composing reply", sub: "Structuring the answer…" },
] as const

export type MindChatThinkingProps = {
  phase?: number
  className?: string
  compact?: boolean
}

export function MindChatThinking({ phase = 0, className, compact = false }: MindChatThinkingProps) {
  const idx = Math.min(phase, PHASE_LABELS.length - 1)
  const { title, sub } = PHASE_LABELS[idx]!

  return (
    <div
      className={cn("flex flex-col items-center", className)}
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <div className={cn("relative flex items-center justify-center", compact ? "h-28 w-28" : "h-36 w-36")}>
        <div
          className="absolute inset-0 animate-[mind-orb-pulse_2.4s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(2, 132, 199,0.55),rgba(2, 132, 199,0.35)_45%,transparent_70%)] blur-xl"
          aria-hidden
        />
        <div
          className={cn(
            "relative animate-[mind-orb-float_3.2s_ease-in-out_infinite] rounded-full",
            compact ? "h-20 w-20" : "h-28 w-28",
            "bg-[radial-gradient(circle_at_30%_25%,rgba(2, 132, 199,0.35)_0%,rgba(2, 132, 199,0.55)_50%,rgba(2, 132, 199,0.85)_100%)]",
            "shadow-[0_0_40px_rgba(2, 132, 199,0.35),0_0_80px_rgba(2, 132, 199,0.2)]"
          )}
          aria-hidden
        >
          <div
            className="absolute inset-[18%] animate-[mind-orb-shimmer_2s_linear_infinite] rounded-full bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.85),rgba(255,255,255,0.15)_50%,transparent_72%)]"
            aria-hidden
          />
          <div
            className="absolute -inset-1 animate-[mind-orb-ring_2.8s_ease-in-out_infinite] rounded-full border border-mind/40"
            aria-hidden
          />
        </div>
        <div
          className={cn(
            "absolute -top-1 z-10 rounded-full bg-white/95 px-3 py-1 text-[12px] font-medium text-mind shadow-sm",
            "animate-[mind-label-fade_2.4s_ease-in-out_infinite] dark:bg-zinc-900/95 dark:text-mind/18"
          )}
        >
          Thinking…
        </div>
      </div>

      <div className={cn("mt-5 text-center", compact && "mt-3")}>
        <p className="text-[15px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">{title}</p>
        <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">{sub}</p>
      </div>
    </div>
  )
}

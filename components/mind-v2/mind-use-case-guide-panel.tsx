"use client"

import Link from "next/link"
import { Copy, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { LANDING_WEB_APP_HREF } from "@/lib/mind-landing-copy"
import type { UseCaseGuide } from "@/lib/mind-use-case-guides"
import { UseCaseThumbnail } from "@/components/mind-landing/landing-product-shots"
import { Button } from "@/components/ui/button"

export type MindUseCaseGuidePanelProps = {
  guide: UseCaseGuide | null
  open: boolean
  onClose: () => void
  /** Prefill Agent / landing try flow */
  onUsePrompt?: (prompt: string) => void
  className?: string
}

export function MindUseCaseGuidePanel({
  guide,
  open,
  onClose,
  onUsePrompt,
  className,
}: MindUseCaseGuidePanelProps) {
  if (!open || !guide) return null

  function copyPrompt() {
    void navigator.clipboard.writeText(guide!.starterPrompt)
    toast.success("Prompt copied")
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[220] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="use-case-guide-title"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex max-h-[min(92vh,720px)] w-full flex-col overflow-hidden bg-white shadow-xl",
          "rounded-t-2xl sm:max-w-lg sm:rounded-2xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("shrink-0 border-b border-stone-100 bg-gradient-to-b p-4", guide.tint)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Step-by-step</p>
              <h2 id="use-case-guide-title" className="mt-1 text-[20px] font-semibold text-slate-900">
                {guide.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 hover:bg-white/80"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/60 bg-white/80">
            <UseCaseThumbnail scene={guide.scene} className="h-[88px]" />
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[14px] leading-relaxed text-slate-600">{guide.summary}</p>
          <p className="mt-3 rounded-xl bg-stone-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-800">Outcome: </span>
            {guide.outcome}
          </p>

          <ol className="mt-6 space-y-4">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[12px] font-bold text-white"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="inline-block rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {step.where}
                  </p>
                  <p className="mt-2 text-[14px] font-medium leading-snug text-slate-800">{step.action}</p>
                  {step.detail ? (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{step.detail}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-xl border border-stone-200/90 bg-stone-50/50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Starter prompt</p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{guide.starterPrompt}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-stone-100 p-4 sm:flex-row">
          <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={copyPrompt}>
            <Copy className="mr-2 h-4 w-4" />
            Copy prompt
          </Button>
          {onUsePrompt ? (
            <Button
              type="button"
              className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800"
              onClick={() => {
                onUsePrompt(guide.starterPrompt)
                onClose()
                toast.message("Prompt ready", { description: "Edit and send when you are ready." })
              }}
            >
              Use in composer
            </Button>
          ) : (
            <Button asChild className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800">
              <Link href={LANDING_WEB_APP_HREF}>Open web app</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export type UseCaseCardProps = {
  guide: UseCaseGuide
  onOpenGuide: (id: string) => void
  className?: string
  /** Slightly shorter preview for web workspace Agent home */
  compact?: boolean
}

/** Clickable use-case tile for landing / Agent home */
export function UseCaseCard({ guide, onOpenGuide, className, compact = false }: UseCaseCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpenGuide(guide.id)}
      className={cn(
        "group w-full overflow-hidden rounded-2xl bg-white text-left",
        "shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]",
        "transition-shadow hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      <div className={cn("border-b border-white/60 bg-gradient-to-b p-3", guide.tint)}>
        <UseCaseThumbnail
          scene={guide.scene}
          className={cn("rounded-xl", compact ? "h-[76px]" : "h-[100px]")}
        />
      </div>
      <div className={cn("px-4", compact ? "py-3" : "py-3.5")}>
        <p className="text-[14px] font-semibold text-zinc-800 group-hover:text-zinc-900">{guide.title}</p>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">{guide.desc}</p>
        <p className="mt-2.5 text-[11px] font-medium text-teal-700/90">View step-by-step guide →</p>
      </div>
    </button>
  )
}

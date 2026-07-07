"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import {
  type FactoryGenerationSettings,
  type FactoryModalKind,
} from "@/components/mind-v2/content-factory-modals"
import { factoryKindShortLabel } from "@/components/mind-v2/content-factory-progress-panel"
import { MINDER_FACTORY_ITEMS } from "@/components/mind-v2/minder-factory-card"

export function AgentTaskHandoffModal({
  kind,
  libraryScopeLabel,
  onClose,
  onStart,
}: {
  kind: FactoryModalKind
  libraryScopeLabel: string
  onClose: () => void
  onStart: (kind: FactoryModalKind, settings?: FactoryGenerationSettings) => void
}) {
  const meta = MINDER_FACTORY_ITEMS.find((i) => i.id === kind)
  const Icon = meta?.icon
  const [slidePages, setSlidePages] = useState(12)

  return (
    <div
      className="absolute inset-0 z-[95] flex flex-col justify-end bg-black/40 sm:items-center sm:justify-center sm:p-4"
      role="presentation"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div
        className="relative z-10 flex max-h-[min(78dvh,520px)] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl dark:bg-zinc-950"
        role="dialog"
        aria-modal
        aria-labelledby="agent-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
          <div className="flex min-w-0 items-center gap-2">
            {Icon ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mind/10 text-mind">
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 id="agent-task-title" className="text-[16px] font-semibold text-zinc-800 dark:text-zinc-50">
                New task · {factoryKindShortLabel(kind)}
              </h2>
              <p className="text-[12px] text-zinc-500">Agent delivers — not Studio direct export</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto px-4 py-4">
          <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            Mindar will scan <span className="font-medium text-zinc-800 dark:text-zinc-100">{libraryScopeLabel}</span>,
            run the task in the background, and post the outcome in chat. This is separate from{" "}
            <span className="font-medium">Studio</span> in a library, where you generate files directly with format
            settings.
          </p>

          {kind === "slides" ? (
            <div className="mt-5 rounded-xl border border-stone-200/90 bg-stone-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
              <p className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-200">Deck length</p>
              <p className="mt-1 text-[12px] text-zinc-500">Approximate slide count for the PPT outline</p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min={6}
                  max={40}
                  step={1}
                  value={slidePages}
                  onChange={(e) => setSlidePages(Number(e.target.value))}
                  className="min-w-0 flex-1 accent-mind"
                />
                <span className="w-12 shrink-0 text-right text-[14px] font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">
                  {slidePages}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-stone-100 px-4 py-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={() =>
              onStart(kind, kind === "slides" ? { slidesPageCount: slidePages } : undefined)
            }
            className={cn("w-full rounded-xl py-3 text-[15px] font-semibold text-white", mx.brandCta)}
          >
            Start task
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronRight, Sparkles, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"

export type RecordingGenerationMode = "auto" | "custom"

export type RecordingGenerationConfig = {
  mode: RecordingGenerationMode
  templateName?: string
  autoLabelSpeakers: boolean
  audioLanguage: string
  aiModel: string
}

const DEFAULT_CONFIG: Omit<RecordingGenerationConfig, "mode"> = {
  autoLabelSpeakers: false,
  audioLanguage: "English (US)",
  aiModel: "Auto",
}

export function RecordingGenerationSheet({
  open,
  onClose,
  templateLabel = "Meeting notes",
  onPickTemplate,
  onGenerate,
}: {
  open: boolean
  onClose: () => void
  templateLabel?: string
  onPickTemplate: () => void
  onGenerate: (config: RecordingGenerationConfig) => void
}) {
  const [mode, setMode] = useState<RecordingGenerationMode>("auto")

  if (!open) return null

  return (
    <div className="absolute inset-0 z-[70] flex flex-col justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        className="relative z-10 flex max-h-[min(88dvh,640px)] w-full flex-col overflow-hidden rounded-t-[1.25rem] bg-white shadow-2xl dark:bg-zinc-950"
        role="dialog"
        aria-modal
        aria-labelledby="recording-gen-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-1 pt-2.5">
          <div className="h-1 w-10 rounded-full bg-stone-200 dark:bg-zinc-700" aria-hidden />
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-1">
          <button
            type="button"
            onClick={() => setMode("auto")}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
              mode === "auto"
                ? "border-mind/30 bg-mind/5 dark:border-mind/25 dark:bg-mind/10"
                : "border-stone-200/90 bg-white dark:border-zinc-700 dark:bg-zinc-900/40"
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-violet-400 to-fuchsia-400 text-white">
              <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-[16px] font-semibold text-transparent dark:from-teal-400 dark:to-emerald-400">
                Auto-generate
              </span>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                Mindar picks the best-matching transcript and summary template — no manual setup.
              </p>
            </span>
            <span
              className={cn(
                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                mode === "auto" ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100" : "border-stone-300"
              )}
              aria-hidden
            >
              {mode === "auto" ? (
                <span className="h-2 w-2 rounded-full bg-white dark:bg-zinc-900" />
              ) : null}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("custom")}
            className={cn(
              "mt-3 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
              mode === "custom"
                ? "border-mind/30 bg-mind/5 dark:border-mind/25 dark:bg-mind/10"
                : "border-stone-200/90 bg-white dark:border-zinc-700 dark:bg-zinc-900/40"
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Settings2 className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">Custom generate</span>
              {mode === "custom" ? (
                <div className="mt-3 space-y-0 divide-y divide-stone-100 rounded-xl border border-stone-100/90 dark:divide-zinc-800 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPickTemplate()
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left"
                  >
                    <span className="text-[14px] text-zinc-600 dark:text-zinc-300">Template</span>
                    <span className="flex items-center gap-1 text-[14px] font-medium text-zinc-800 dark:text-zinc-100">
                      {templateLabel}
                      <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
                    </span>
                  </button>
                  <div className="flex items-center justify-between gap-3 px-3 py-3">
                    <span className="flex items-center gap-2 text-[14px] text-zinc-600 dark:text-zinc-300">
                      Auto-label speakers
                      <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800">
                        Beta
                      </span>
                    </span>
                    <span className="text-[13px] text-zinc-400">Off</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-3">
                    <span className="text-[14px] text-zinc-600 dark:text-zinc-300">Audio language</span>
                    <span className="text-[14px] font-medium text-zinc-800 dark:text-zinc-100">English (US)</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-3">
                    <span className="text-[14px] text-zinc-600 dark:text-zinc-300">AI model</span>
                    <span className="flex items-center gap-1 text-[14px] font-medium text-zinc-800 dark:text-zinc-100">
                      Auto
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
                      <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
                    </span>
                  </div>
                </div>
              ) : null}
            </span>
            <span
              className={cn(
                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                mode === "custom"
                  ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100"
                  : "border-stone-300"
              )}
              aria-hidden
            >
              {mode === "custom" ? (
                <span className="h-2 w-2 rounded-full bg-white dark:bg-zinc-900" />
              ) : null}
            </span>
          </button>
        </div>

        <div className="shrink-0 border-t border-stone-100 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={() =>
              onGenerate({
                mode,
                templateName: mode === "custom" ? templateLabel : undefined,
                ...DEFAULT_CONFIG,
              })
            }
            className="flex w-full items-center justify-center rounded-2xl bg-zinc-900 py-4 text-[17px] font-semibold dark:bg-zinc-100"
          >
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent dark:from-teal-600 dark:to-emerald-600">
              Generate now
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

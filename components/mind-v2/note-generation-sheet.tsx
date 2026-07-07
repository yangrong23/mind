"use client"

import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { ChevronRight, Settings2, Sparkles } from "lucide-react"

export type NoteGenerationMode = "auto" | "custom"

export type NoteGenerationSheetProps = {
  mode: NoteGenerationMode
  onModeChange: (mode: NoteGenerationMode) => void
  templateLabel?: string
  onPickTemplate?: () => void
  autoLabelSpeakers: boolean
  onAutoLabelSpeakersChange: (next: boolean) => void
  audioLanguage: string
  onPickAudioLanguage?: () => void
  aiModel: string
  onPickAiModel?: () => void
  onGenerate: () => void
  generateDisabled?: boolean
  className?: string
}

function ModeRadio({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        selected ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-300 dark:border-zinc-600"
      )}
      aria-hidden
    >
      {selected ? <span className="h-2.5 w-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100" /> : null}
    </span>
  )
}

function CustomSettingRow({
  label,
  value,
  badge,
  onClick,
  trailing,
}: {
  label: string
  value?: string
  badge?: string
  onClick?: () => void
  trailing?: React.ReactNode
}) {
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-2 text-[15px] text-zinc-900 dark:text-zinc-100">
        {label}
        {badge ? (
          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {badge}
          </span>
        ) : null}
      </span>
      {trailing ?? (
        <span className="flex max-w-[52%] shrink-0 items-center gap-1 text-[14px] text-zinc-500 dark:text-zinc-400">
          <span className="truncate">{value}</span>
          {onClick ? <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" strokeWidth={2} /> : null}
        </span>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-3 border-t border-stone-100 px-4 py-3.5 text-left transition-colors hover:bg-stone-50/80 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
      >
        {body}
      </button>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-stone-100 px-4 py-3.5 dark:border-zinc-800">
      {body}
    </div>
  )
}

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-[30px] w-[50px] shrink-0 rounded-full transition-colors",
        on ? "bg-mind" : "bg-stone-200 dark:bg-zinc-700"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-[22px]" : "translate-x-[3px]"
        )}
      />
    </button>
  )
}

export function NoteGenerationSheet({
  mode,
  onModeChange,
  templateLabel,
  onPickTemplate,
  autoLabelSpeakers,
  onAutoLabelSpeakersChange,
  audioLanguage,
  onPickAudioLanguage,
  aiModel,
  onPickAiModel,
  onGenerate,
  generateDisabled = false,
  className,
}: NoteGenerationSheetProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-[45] flex flex-col justify-end",
        className
      )}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-generation-sheet-title"
        className="pointer-events-auto rounded-t-[1.35rem] bg-white shadow-[0_-12px_48px_-8px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom duration-300 dark:bg-zinc-950"
      >
        <div className="flex justify-center pb-1 pt-2.5">
          <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>

        <div className="space-y-0 px-4 pb-2 pt-1">
          <button
            type="button"
            onClick={() => onModeChange("auto")}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl px-1 py-3 text-left transition-colors",
              mode === "auto" && "bg-stone-50/80 dark:bg-zinc-900/40"
            )}
          >
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 via-sky-50 to-teal-50 dark:from-violet-950/40 dark:via-sky-950/30 dark:to-teal-950/20">
              <Sparkles className="h-5 w-5 text-violet-500 dark:text-violet-300" strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 pr-2">
              <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-teal-500 bg-clip-text text-[17px] font-semibold text-transparent">
                Auto-generate
              </span>
              <p className="mt-1 text-[13px] leading-snug text-zinc-500 dark:text-zinc-400">
                Mindar picks the best transcript and summary template — no manual setup.
              </p>
            </span>
            <ModeRadio selected={mode === "auto"} />
          </button>

          <div
            className={cn(
              "overflow-hidden rounded-2xl transition-colors",
              mode === "custom" && "bg-stone-50/80 dark:bg-zinc-900/40"
            )}
          >
            <button
              type="button"
              onClick={() => onModeChange("custom")}
              className="flex w-full items-center gap-3 px-1 py-3 text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-zinc-800">
                <Settings2 className="h-5 w-5 text-zinc-700 dark:text-zinc-200" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">
                Custom generate
              </span>
              <ModeRadio selected={mode === "custom"} />
            </button>

            {mode === "custom" ? (
              <div className="mx-1 mb-2 overflow-hidden rounded-xl border border-stone-200/90 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                <CustomSettingRow
                  label="Template"
                  value={templateLabel ?? "Choose template"}
                  onClick={onPickTemplate}
                />
                <CustomSettingRow
                  label="Auto-label speakers"
                  badge="Beta"
                  trailing={
                    <ToggleSwitch on={autoLabelSpeakers} onChange={onAutoLabelSpeakersChange} />
                  }
                />
                <CustomSettingRow
                  label="Audio language"
                  value={audioLanguage}
                  onClick={onPickAudioLanguage}
                />
                <CustomSettingRow label="AI model" value={aiModel} onClick={onPickAiModel} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-stone-100 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 dark:border-zinc-800">
          <button
            type="button"
            id="note-generation-sheet-title"
            onClick={onGenerate}
            disabled={generateDisabled}
            className={cn(
              "flex w-full items-center justify-center rounded-2xl bg-zinc-900 py-4 text-[17px] font-semibold transition-opacity dark:bg-zinc-100",
              generateDisabled && "pointer-events-none opacity-45"
            )}
          >
            <span className="bg-gradient-to-r from-sky-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent dark:from-sky-600 dark:via-teal-600 dark:to-emerald-600">
              Generate now
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

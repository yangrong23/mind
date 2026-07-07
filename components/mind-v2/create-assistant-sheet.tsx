"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Sparkles, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import {
  ASSISTANT_NAME_SUGGESTIONS,
  ASSISTANT_PERSONA_TEMPLATES,
  aiSuggestAssistantName,
  aiSuggestAssistantPersona,
} from "@/lib/assistant-create-presets"

const STEPS = [
  { id: "name", label: "Name" },
  { id: "persona", label: "Persona" },
] as const

type StepId = (typeof STEPS)[number]["id"]

function AiFieldButton({
  loading,
  onClick,
  label = "Suggest with AI",
}: {
  loading: boolean
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-mind transition-opacity",
        "hover:bg-mind/8 disabled:opacity-50"
      )}
    >
      <Sparkles className={cn("h-3.5 w-3.5", loading && "animate-pulse")} strokeWidth={2} />
      {loading ? "Generating…" : label}
    </button>
  )
}

export function CreateAssistantSheet({
  libraries: _libraries,
  onClose,
  onSave,
}: {
  libraries: KnowledgeBase[]
  onClose: () => void
  onSave: (payload: { name: string; persona: string; linkedKbIds: number[] }) => void
}) {
  const [step, setStep] = useState<StepId>("name")
  const [name, setName] = useState("")
  const [persona, setPersona] = useState("")
  const [generating, setGenerating] = useState<"name" | "persona" | null>(null)

  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const canSave = name.trim().length > 0

  function runAiName() {
    setGenerating("name")
    window.setTimeout(() => {
      setName(aiSuggestAssistantName(persona || undefined))
      setGenerating(null)
      toast.message("Name suggested", { description: "Edit or regenerate anytime." })
    }, 420)
  }

  function runAiPersona() {
    setGenerating("persona")
    window.setTimeout(() => {
      setPersona(aiSuggestAssistantPersona(name))
      setGenerating(null)
      toast.message("Persona drafted", { description: "Tuned from your assistant name (demo)." })
    }, 520)
  }

  function goNext() {
    if (step === "name") {
      if (!name.trim()) {
        toast.error("Add a name first")
        return
      }
      setStep("persona")
      if (!persona.trim()) runAiPersona()
      return
    }
    if (step === "persona") {
      submit()
    }
  }

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    if (!canSave) return
    onSave({ name: name.trim(), persona, linkedKbIds: [] })
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white font-sans dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-stone-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button type="button" onClick={onClose} className="text-[15px] text-zinc-600 dark:text-zinc-400">
          Cancel
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">New assistant</h1>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => submit()}
          className={cn("text-[15px] font-semibold", canSave ? "text-mind" : "text-zinc-400")}
        >
          Save
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 border-b border-stone-100 px-5 py-3 dark:border-zinc-800">
        {STEPS.map((s, i) => {
          const done = i < stepIndex
          const active = s.id === step
          return (
            <div key={s.id} className="flex min-w-0 flex-1 items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (i <= stepIndex) setStep(s.id)
                }}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1 transition-colors",
                  active && "bg-mind/5"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                    done
                      ? "bg-mind text-white"
                      : active
                        ? "bg-mind/15 text-mind"
                        : "bg-stone-100 text-zinc-400 dark:bg-zinc-800"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "truncate text-[10px] font-semibold uppercase tracking-wide",
                    active ? "text-mind" : "text-zinc-400"
                  )}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 ? (
                <div className={cn("h-px w-2 shrink-0", done ? "bg-mind/40" : "bg-stone-200 dark:bg-zinc-700")} />
              ) : null}
            </div>
          )
        })}
      </div>

      <form
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
        onSubmit={(e) => {
          e.preventDefault()
          goNext()
        }}
      >
        {step === "name" ? (
          <div className="rounded-2xl border border-stone-100 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-start justify-between gap-2">
              <div>
                <label className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Assistant name</label>
                <p className="mt-1 text-[13px] text-zinc-500">How it appears in your Mindar list.</p>
              </div>
              <AiFieldButton loading={generating === "name"} onClick={runAiName} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product research aide"
              className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50/80 px-3.5 py-3 text-[15px] outline-none ring-mind/20 focus:border-mind/40 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              autoFocus
            />
            <p className="mt-3 text-[12px] font-medium text-zinc-500">Suggestions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ASSISTANT_NAME_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setName(suggestion)}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[13px] font-medium text-zinc-700 hover:border-mind/30 hover:bg-mind/5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "persona" ? (
          <div className="rounded-2xl border border-stone-100 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-start justify-between gap-2">
              <div>
                <label className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Instructions</label>
                <p className="mt-1 text-[13px] text-zinc-500">Tone, priorities, and how replies should behave.</p>
              </div>
              <AiFieldButton loading={generating === "persona"} onClick={runAiPersona} />
            </div>
            <textarea
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="How should this assistant sound and what should it prioritize?"
              rows={5}
              className="mt-3 w-full resize-none rounded-xl border border-stone-200 bg-stone-50/80 px-3.5 py-3 text-[15px] leading-relaxed outline-none ring-mind/20 focus:border-mind/40 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <p className="mt-3 text-[12px] font-medium text-zinc-500">Persona templates</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ASSISTANT_PERSONA_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setPersona(tpl.text)}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[13px] font-medium text-zinc-700 hover:border-mind/30 hover:bg-mind/5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </form>

      <div className="shrink-0 border-t border-stone-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-zinc-800">
        <button
          type="button"
          onClick={goNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mind py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-90"
        >
          {step === "persona" ? "Create assistant" : "Continue"}
          <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  )
}

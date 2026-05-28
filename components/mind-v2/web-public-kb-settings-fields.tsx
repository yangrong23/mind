"use client"

import { useMemo, useState } from "react"
import { Plus, Sparkles, Trash2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Agent } from "@/components/mind-v2/agent-tab"
import {
  DEFAULT_PUBLIC_KB_SETTINGS,
  PUBLIC_KB_CAPABILITY_PRESETS,
  PUBLIC_KB_DISCLAIMER_PRESETS,
  PUBLIC_KB_SKILL_PRESETS,
  deriveWhatItCanDo,
  newPublicKbSkillId,
  publicAgentDisplayName,
  type PublicKbAgentSkill,
  type PublicKbSettings,
  type PublicKbUpdateCadence,
} from "@/lib/public-kb-settings"

export { normalizePublicKbSettings, validatePublicKbSettings } from "@/lib/public-kb-settings"

const STEPS = [
  { id: "identity", label: "Plaza listing" },
  { id: "behavior", label: "Capabilities & behavior" },
  { id: "starters", label: "Conversation starters" },
  { id: "trust", label: "Trust & sharing" },
] as const

type StepId = (typeof STEPS)[number]["id"]

const UPDATE_CADENCE_OPTIONS: { value: PublicKbUpdateCadence; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "manual", label: "Manual sync only" },
]

export function WebPublicKbSettingsFields({
  value,
  onChange,
  agents,
}: {
  value: PublicKbSettings
  onChange: (next: PublicKbSettings) => void
  agents: Agent[]
}) {
  const [step, setStep] = useState<StepId>("identity")
  const previewCanDo = useMemo(() => deriveWhatItCanDo(value.skills), [value.skills])

  function setPublic(isPublic: boolean) {
    onChange({ ...value, isPublic })
    if (isPublic) setStep("identity")
  }

  function toggleCapability(cap: string) {
    const has = value.capabilities.includes(cap)
    const next = has
      ? value.capabilities.filter((c) => c !== cap)
      : value.capabilities.length >= 4
        ? value.capabilities
        : [...value.capabilities, cap]
    onChange({ ...value, capabilities: next })
  }

  function updateSkill(id: string, patch: Partial<PublicKbAgentSkill>) {
    onChange({
      ...value,
      skills: value.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })
  }

  function removeSkill(id: string) {
    onChange({ ...value, skills: value.skills.filter((s) => s.id !== id) })
  }

  function addPreset(preset: (typeof PUBLIC_KB_SKILL_PRESETS)[number]) {
    onChange({
      ...value,
      skills: [
        ...value.skills,
        { id: newPublicKbSkillId(), label: preset.label, instruction: preset.instruction },
      ],
    })
  }

  function addExampleQuestion() {
    if (value.exampleQuestions.length >= 4) return
    onChange({ ...value, exampleQuestions: [...value.exampleQuestions, ""] })
  }

  function updateExampleQuestion(index: number, text: string) {
    onChange({
      ...value,
      exampleQuestions: value.exampleQuestions.map((q, i) => (i === index ? text : q)),
    })
  }

  function removeExampleQuestion(index: number) {
    onChange({
      ...value,
      exampleQuestions: value.exampleQuestions.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="mt-5 border-t border-stone-100 pt-5 dark:border-zinc-800">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={value.isPublic}
          onChange={(e) => setPublic(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-stone-300 text-mind focus:ring-mind/30"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-zinc-800 dark:text-zinc-100">
            Publish as public knowledge base
          </span>
          <span className="mt-0.5 block text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            List in the plaza — subscribers open Chat to ask questions scoped to your library.
          </span>
        </span>
      </label>

      {value.isPublic ? (
        <div className="mt-4 overflow-hidden rounded-xl bg-stone-50/80 ring-1 ring-stone-200/80 dark:bg-zinc-900/50 dark:ring-zinc-700">
          <div className="flex gap-1 overflow-x-auto border-b border-stone-200/80 px-2 py-2 dark:border-zinc-700">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                  step === s.id
                    ? "bg-white text-zinc-800 shadow-sm dark:bg-zinc-950 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                <span className="tabular-nums text-zinc-400">{i + 1}</span>
                {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-4 p-4">
            {step === "identity" ? (
              <>
                <label className="block">
                  <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                    Plaza display name
                  </span>
                  <input
                    type="text"
                    value={value.displayName}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        displayName: e.target.value,
                        boundAgentName: e.target.value.trim(),
                      })
                    }
                    placeholder="Library name on plaza cards"
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-teal-300 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Tagline</span>
                  <input
                    type="text"
                    value={value.tagline}
                    onChange={(e) => onChange({ ...value, tagline: e.target.value })}
                    maxLength={80}
                    placeholder="One-line scenario — e.g. Exam prep with cited timelines"
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-teal-300 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <p className="mt-1 text-[11px] text-zinc-400">{value.tagline.length}/80 · Shown on plaza cards and detail</p>
                </label>
              </>
            ) : null}

            {step === "behavior" ? (
              <>
                <div>
                  <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Capabilities</span>
                  <p className="mt-0.5 text-[11px] text-zinc-400">Pick up to 4 tags for plaza discovery</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PUBLIC_KB_CAPABILITY_PRESETS.map((cap) => {
                      const active = value.capabilities.includes(cap)
                      return (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => toggleCapability(cap)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors",
                            active
                              ? "bg-teal-50 text-teal-800 ring-teal-200"
                              : "bg-white text-zinc-600 ring-stone-200 hover:bg-stone-50"
                          )}
                        >
                          {cap}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Agent skills</span>
                    <span className="text-[11px] text-zinc-400">Instructions on every reply</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PUBLIC_KB_SKILL_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => addPreset(preset)}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-mind ring-1 ring-stone-200 hover:bg-stone-50"
                      >
                        <Plus className="h-3 w-3" aria-hidden />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  {value.skills.length > 0 ? (
                    <ul className="mt-3 space-y-3">
                      {value.skills.map((skill) => (
                        <li
                          key={skill.id}
                          className="rounded-xl border border-stone-200/90 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 shrink-0 text-mind" aria-hidden />
                            <input
                              type="text"
                              value={skill.label}
                              onChange={(e) => updateSkill(skill.id, { label: e.target.value })}
                              placeholder="Skill name"
                              className="min-w-0 flex-1 rounded-lg border-0 bg-transparent text-[13px] font-semibold text-zinc-800 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeSkill(skill.id)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-stone-100 hover:text-red-600"
                              aria-label="Remove skill"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <textarea
                            value={skill.instruction}
                            onChange={(e) => updateSkill(skill.id, { instruction: e.target.value })}
                            rows={2}
                            placeholder="How should the agent use this library?"
                            className="mt-2 w-full resize-none rounded-lg bg-stone-50/80 px-2.5 py-2 text-[12px] leading-relaxed text-zinc-700 outline-none"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[12px] text-zinc-500">Add at least one skill so visitors know how to use this library.</p>
                  )}
                </div>
                {previewCanDo.length > 0 ? (
                  <div className="rounded-xl border border-dashed border-stone-200 bg-white/70 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Preview · What it can do</p>
                    <ul className="mt-2 space-y-1">
                      {previewCanDo.map((line) => (
                        <li key={line} className="text-[12px] text-zinc-600">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : null}

            {step === "starters" ? (
              <>
                <p className="text-[12px] text-zinc-500">Add 2–4 prompts subscribers can tap on detail and in chat.</p>
                <ul className="space-y-2">
                  {value.exampleQuestions.map((q, i) => (
                    <li key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => updateExampleQuestion(i, e.target.value)}
                        placeholder={`Example question ${i + 1}`}
                        className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-teal-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeExampleQuestion(i)}
                        className="rounded-lg p-2 text-zinc-400 hover:text-red-600"
                        aria-label="Remove question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                {value.exampleQuestions.length < 4 ? (
                  <button
                    type="button"
                    onClick={addExampleQuestion}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-mind hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add example question
                  </button>
                ) : null}
                {value.skills.length > 0 && value.exampleQuestions.length < 2 ? (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...value,
                        exampleQuestions: [
                          ...value.exampleQuestions,
                          `Summarize "${publicAgentDisplayName(value)}" sources with citations`,
                          "What should a newcomer ask first?",
                        ].slice(0, 4),
                      })
                    }
                    className="text-[12px] font-medium text-zinc-500 hover:text-zinc-700"
                  >
                    Generate starters from skills
                  </button>
                ) : null}
              </>
            ) : null}

            {step === "trust" ? (
              <>
                <label className="block">
                  <span className="text-[13px] font-medium text-zinc-700">Grounding</span>
                  <select
                    value={value.groundingMode}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        groundingMode: e.target.value as PublicKbSettings["groundingMode"],
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none"
                  >
                    <option value="library-only">Library sources only</option>
                    <option value="library-preferred">Library-first (may use general knowledge)</option>
                  </select>
                </label>
                <div>
                  <span className="text-[13px] font-medium text-zinc-700">Disclaimer</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {PUBLIC_KB_DISCLAIMER_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onChange({ ...value, disclaimer: preset.text })}
                        className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-stone-200 hover:bg-stone-50"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={value.disclaimer}
                    onChange={(e) => onChange({ ...value, disclaimer: e.target.value })}
                    rows={2}
                    placeholder="Boundary & compliance copy shown in Trust section and chat footer"
                    className="mt-2 w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-[13px] outline-none"
                  />
                </div>
                <label className="block">
                  <span className="text-[13px] font-medium text-zinc-700">Update cadence</span>
                  <select
                    value={value.updateCadence ?? "weekly"}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        updateCadence: e.target.value as PublicKbUpdateCadence,
                        lastSyncedAt: new Date().toISOString(),
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none"
                  >
                    {UPDATE_CADENCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex cursor-pointer items-start gap-3 pt-1">
                  <input
                    type="checkbox"
                    checked={value.shareFactoryOutputsWithEveryone}
                    onChange={(e) =>
                      onChange({ ...value, shareFactoryOutputsWithEveryone: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-stone-300 text-mind focus:ring-mind/30"
                  />
                  <span className="min-w-0 flex-1 text-[12px] leading-relaxed text-zinc-600">
                    <span className="font-medium text-zinc-800">Share Studio outputs publicly</span>
                    {" — "}
                    Reports, audio, and slides from this library can be viewed and remixed by subscribers.
                  </span>
                </label>
              </>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-stone-200/80 px-4 py-3 dark:border-zinc-700">
            <button
              type="button"
              disabled={step === "identity"}
              onClick={() => {
                const i = STEPS.findIndex((s) => s.id === step)
                if (i > 0) setStep(STEPS[i - 1]!.id)
              }}
              className="text-[12px] font-medium text-zinc-500 disabled:opacity-40"
            >
              Back
            </button>
            {step !== "trust" ? (
              <button
                type="button"
                onClick={() => {
                  const i = STEPS.findIndex((s) => s.id === step)
                  if (i < STEPS.length - 1) setStep(STEPS[i + 1]!.id)
                }}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-teal-700"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="text-[11px] text-zinc-400">Ready to publish when you save</span>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-zinc-400">Private libraries stay in Personal or Shared until you publish.</p>
      )}
    </div>
  )
}

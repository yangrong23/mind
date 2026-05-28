"use client"

import { useMemo } from "react"
import { Plus, Sparkles, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Agent } from "@/components/mind-v2/agent-tab"
import {
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

export type LibraryAgentStepId = "identity" | "behavior" | "starters" | "trust"

const UPDATE_CADENCE_OPTIONS: { value: PublicKbUpdateCadence; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "manual", label: "Manual sync only" },
]

export function WebLibraryAgentFields({
  step,
  value,
  onChange,
  agents,
  showPlazaCapabilities = false,
}: {
  step: LibraryAgentStepId
  value: PublicKbSettings
  onChange: (next: PublicKbSettings) => void
  agents: Agent[]
  /** Capability tags — required when publishing to plaza */
  showPlazaCapabilities?: boolean
}) {
  const previewCanDo = useMemo(() => deriveWhatItCanDo(value.skills), [value.skills])

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
    if (value.exampleQuestions.length >= 6) return
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

  if (step === "identity") {
    return (
      <div className="space-y-4">
        <p className="text-[12px] leading-relaxed text-zinc-500">
          How this library appears in the plaza. Subscribers chat via the Chat icon — no separate agent
          profile is shown.
        </p>
        <label className="block">
          <span className="text-[13px] font-medium text-zinc-700">Plaza display name</span>
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
            placeholder="e.g. Deep reading room"
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-mind/20"
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-zinc-700">One-line tagline</span>
          <input
            type="text"
            value={value.tagline}
            onChange={(e) => onChange({ ...value, tagline: e.target.value })}
            maxLength={80}
            placeholder="How should people use this library?"
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-mind/20"
          />
          <p className="mt-1 text-[11px] text-zinc-400">{value.tagline.length}/80</p>
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-zinc-700">Library scope</span>
          <textarea
            value={value.topicScope}
            onChange={(e) => onChange({ ...value, topicScope: e.target.value })}
            rows={3}
            placeholder="What belongs here? e.g. CN/US patent filings, office actions, and claim-mapping checklists — not general legal advice."
            className="mt-1.5 w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-[14px] leading-relaxed outline-none focus:ring-2 focus:ring-mind/20"
          />
        </label>
      </div>
    )
  }

  if (step === "behavior") {
    return (
      <div className="space-y-4">
        {showPlazaCapabilities ? (
          <div>
            <span className="text-[13px] font-medium text-zinc-700">Plaza capability tags</span>
            <p className="mt-0.5 text-[11px] text-zinc-400">Pick up to 4 tags for discovery</p>
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
                        ? "bg-mind/10 text-mind ring-mind/25"
                        : "bg-white text-zinc-600 ring-stone-200 hover:bg-stone-50"
                    )}
                  >
                    {cap}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-zinc-700">Agent skills</span>
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
                  className="rounded-xl border border-stone-200/90 bg-white p-3"
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
            <p className="mt-2 text-[12px] text-zinc-500">Add at least one skill.</p>
          )}
        </div>
        {previewCanDo.length > 0 ? (
          <div className="rounded-xl border border-dashed border-stone-200 bg-white/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Preview · What it can do
            </p>
            <ul className="mt-2 space-y-1">
              {previewCanDo.map((line) => (
                <li key={line} className="text-[12px] text-zinc-600">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    )
  }

  if (step === "starters") {
    return (
      <div className="space-y-3">
        <p className="text-[12px] text-zinc-500">
          Starters appear in the library workspace and when someone opens chat. Add questions your
          audience would actually ask.
        </p>
        <ul className="space-y-2">
          {value.exampleQuestions.map((q, i) => (
            <li key={i} className="flex gap-2">
              <input
                type="text"
                value={q}
                onChange={(e) => updateExampleQuestion(i, e.target.value)}
                placeholder={`Starter question ${i + 1}`}
                className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-mind/20"
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
        {value.exampleQuestions.length < 6 ? (
          <button
            type="button"
            onClick={addExampleQuestion}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-mind hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add starter question
          </button>
        ) : null}
        {value.skills.length > 0 && value.exampleQuestions.filter((q) => q.trim()).length < 2 ? (
          <button
            type="button"
            onClick={() =>
              onChange({
                ...value,
                exampleQuestions: [
                  ...value.exampleQuestions.filter((q) => q.trim()),
                  `Summarize the latest sources in "${publicAgentDisplayName(value)}" with citations`,
                  "What should a newcomer ask first?",
                ].slice(0, 6),
              })
            }
            className="text-[12px] font-medium text-zinc-500 hover:text-zinc-700"
          >
            Suggest starters from skills
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-mind/20"
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
          placeholder="Shown in Trust section and chat footer"
          className="mt-2 w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-mind/20"
        />
      </div>
      {value.isPublic ? (
        <>
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
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-mind/20"
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
              Reports, audio, and slides from this library can be viewed by subscribers.
            </span>
          </label>
        </>
      ) : null}
    </div>
  )
}

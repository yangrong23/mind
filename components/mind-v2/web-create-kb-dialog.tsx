"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronRight, FolderPlus, ImagePlus, Plus, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { LibraryCover } from "@/components/mind-v2/library-cover"
import { LIBRARY_COVER_PRESETS } from "@/lib/library-cover-presets"
import type { LibraryCoverVariant } from "@/lib/product-media"
import {
  DEFAULT_TEAM_LIBRARY_SETTINGS,
  type TeamJoinMode,
  type TeamLibrarySettings,
  type TeamMemberPermissions,
} from "@/lib/mock-knowledge-bases"
import type { Agent } from "@/components/mind-v2/agent-tab"
import type { PublicKbSettings } from "@/lib/public-kb-settings"
import {
  defaultAgentSettingsForCreate,
  normalizePublicKbSettings,
  publicAgentDisplayName,
  validateLibraryAgentCore,
  validatePublicKbSettings,
} from "@/lib/public-kb-settings"
import { WebLibraryAgentFields, type LibraryAgentStepId } from "@/components/mind-v2/web-library-agent-fields"
import { WebCreateKbAiBar } from "@/components/mind-v2/web-create-kb-ai-bar"
import { web } from "@/components/mind-v2/web-design"
import {
  aiAssistDelay,
  generateAgentProfileFromLibrary,
  generateLibraryDescription,
  polishPlazaListing,
  suggestCoverVariant,
  type LibraryCreateAiContext,
} from "@/lib/library-create-ai"

export type WebCreateKbPayload = {
  name: string
  description: string
  coverVariant: LibraryCoverVariant
  category: "mine" | "team"
  teamSettings?: TeamLibrarySettings
  publicSettings?: PublicKbSettings
}

export type WebCreateKbDialogMode =
  | { kind: "create"; category: "mine" | "team" }
  | { kind: "edit"; category: "mine" | "team"; kbId: number }

type WizardStepId = "library" | "access" | "agent-identity" | "agent-behavior" | "agent-starters" | "agent-trust" | "publish"

const JOIN_OPTIONS: { value: TeamJoinMode; label: string }[] = [
  { value: "Open join", label: "Join directly" },
  { value: "Admin approval", label: "Requires approval" },
]

const PERM_OPTIONS: { value: TeamMemberPermissions; label: string }[] = [
  { value: "View & export", label: "View and export content" },
  { value: "View only", label: "View only" },
]

function stepsForMode(mode: WebCreateKbDialogMode | null, isEdit: boolean): WizardStepId[] {
  if (!mode) return []
  const isTeam = mode.category === "team"
  if (isEdit) {
    return isTeam
      ? ["library", "access", "agent-identity", "agent-behavior", "agent-starters", "agent-trust", "publish"]
      : ["library", "agent-identity", "agent-behavior", "agent-starters", "agent-trust", "publish"]
  }
  return isTeam
    ? ["library", "access", "agent-identity", "agent-behavior", "agent-starters", "agent-trust", "publish"]
    : ["library", "agent-identity", "agent-behavior", "agent-starters", "agent-trust", "publish"]
}

function stepLabel(step: WizardStepId): string {
  const map: Record<WizardStepId, string> = {
    library: "Library",
    access: "Sharing",
    "agent-identity": "Assistant",
    "agent-behavior": "Skills",
    "agent-starters": "Starters",
    "agent-trust": "Trust",
    publish: "Publish",
  }
  return map[step]
}

function agentStepFromWizard(step: WizardStepId): LibraryAgentStepId | null {
  if (step === "agent-identity") return "identity"
  if (step === "agent-behavior") return "behavior"
  if (step === "agent-starters") return "starters"
  if (step === "agent-trust") return "trust"
  return null
}

function mergeExampleQuestions(
  teamQuestions: string[],
  agentQuestions: string[]
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const q of [...teamQuestions, ...agentQuestions]) {
    const t = q.trim()
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out.slice(0, 6)
}

export function WebCreateKbDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  bindableAgents = [],
}: {
  open: boolean
  mode: WebCreateKbDialogMode | null
  initial?: Partial<WebCreateKbPayload>
  onClose: () => void
  onSubmit: (payload: WebCreateKbPayload) => void
  bindableAgents?: Agent[]
}) {
  const isTeam = mode?.category === "team"
  const isEdit = mode?.kind === "edit"
  const fileRef = useRef<HTMLInputElement>(null)
  const wizardSteps = useMemo(() => stepsForMode(mode, isEdit), [mode, isEdit])

  const [stepIndex, setStepIndex] = useState(0)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [coverVariant, setCoverVariant] = useState<LibraryCoverVariant>("product")
  const [joinMode, setJoinMode] = useState<TeamJoinMode>("Open join")
  const [memberPerms, setMemberPerms] = useState<TeamMemberPermissions>("View & export")
  const [questions, setQuestions] = useState<string[]>([])
  const [questionDraft, setQuestionDraft] = useState("")
  const [publicSettings, setPublicSettings] = useState<PublicKbSettings>(() =>
    defaultAgentSettingsForCreate(bindableAgents)
  )
  const [aiBusy, setAiBusy] = useState<string | null>(null)

  const aiCtx = useMemo((): LibraryCreateAiContext | null => {
    if (!mode) return null
    return {
      name,
      description,
      category: mode.category,
      bindableAgents,
    }
  }, [mode, name, description, bindableAgents])

  useEffect(() => {
    if (!open || !mode) return
    setStepIndex(0)
    setName(initial?.name ?? "")
    setDescription(initial?.description ?? "")
    setCoverVariant(initial?.coverVariant ?? "product")
    const ts = initial?.teamSettings ?? DEFAULT_TEAM_LIBRARY_SETTINGS
    setJoinMode(ts.joinMode)
    setMemberPerms(ts.memberPermissions)
    setQuestions(ts.recommendedQuestions ?? [])
    setQuestionDraft("")
    setPublicSettings(
      initial?.publicSettings
        ? normalizePublicKbSettings(initial.publicSettings)
        : defaultAgentSettingsForCreate(bindableAgents)
    )
    setAiBusy(null)
  }, [open, mode, initial, bindableAgents])

  async function runAiAssist(
    key: string,
    run: () => void | Promise<void>,
    successMessage?: string
  ) {
    if (!aiCtx || aiBusy) return
    setAiBusy(key)
    try {
      await aiAssistDelay()
      await run()
      if (successMessage) toast.success(successMessage)
    } finally {
      setAiBusy(null)
    }
  }

  function seedAgentFromLibraryIfNeeded() {
    if (!aiCtx) return
    const needsSeed =
      !publicSettings.tagline.trim() ||
      !publicSettings.topicScope.trim() ||
      publicSettings.exampleQuestions.filter((q) => q.trim()).length < 2
    if (!needsSeed) return
    setPublicSettings((prev) =>
      normalizePublicKbSettings(generateAgentProfileFromLibrary(aiCtx, prev))
    )
  }

  if (!open || !mode) return null

  const currentStep = wizardSteps[stepIndex] ?? "library"
  const isLastStep = stepIndex >= wizardSteps.length - 1

  const title = isEdit
    ? isTeam
      ? "Edit shared library"
      : "Edit personal library"
    : isTeam
      ? "Create shared library"
      : "Create personal library"

  const subtitle = isTeam
    ? "Invite teammates, configure a library assistant, and optionally publish to the plaza."
    : "Private to you — configure an assistant, add sources, and optionally publish."

  function validateCurrentStep(): string | null {
    if (currentStep === "library") {
      if (!name.trim()) return "Enter a library name."
      if (isTeam && description.trim().length < 12)
        return "Add a short description (at least 12 characters) so teammates know what this library is for."
      return null
    }
    if (currentStep === "access") return null
    const agentStep = agentStepFromWizard(currentStep)
    if (agentStep) {
      const mergedExamples = mergeExampleQuestions(questions, publicSettings.exampleQuestions)
      if (agentStep === "identity") {
        if (!publicAgentDisplayName(publicSettings)) return "Add a plaza display name."
        if (!publicSettings.tagline.trim()) return "Add a one-line tagline."
        if (!publicSettings.topicScope.trim()) return "Describe what sources belong in this library."
        return null
      }
      if (agentStep === "behavior") {
        if (publicSettings.skills.length < 1) return "Add at least one agent skill."
        return null
      }
      if (agentStep === "starters") {
        if (mergedExamples.length < 2) return "Add at least two conversation starters."
        return null
      }
      if (agentStep === "trust") {
        if (publicSettings.groundingMode === "library-only" && !publicSettings.disclaimer.trim())
          return "Add a disclaimer for library-only grounding."
        return null
      }
    }
    if (currentStep === "publish" && publicSettings.isPublic) {
      return validatePublicKbSettings(publicSettings)
    }
    return null
  }

  function goNext() {
    const err = validateCurrentStep()
    if (err) {
      toast.error(err)
      return
    }
    if (!isLastStep) {
      const nextStep = wizardSteps[stepIndex + 1]
      if (currentStep === "library" && nextStep?.startsWith("agent")) {
        seedAgentFromLibraryIfNeeded()
      }
      setStepIndex((i) => i + 1)
      return
    }
    finish()
  }

  function finish() {
    const normalizedPublic = normalizePublicKbSettings({
      ...publicSettings,
      exampleQuestions: mergeExampleQuestions(questions, publicSettings.exampleQuestions),
      ...(publicSettings.isPublic ? { lastSyncedAt: new Date().toISOString() } : {}),
    })
    const err =
      validateLibraryAgentCore(normalizedPublic) ??
      (normalizedPublic.isPublic ? validatePublicKbSettings(normalizedPublic) : null)
    if (err) {
      toast.error(err)
      return
    }
    onSubmit({
      name: name.trim(),
      description:
        description.trim() ||
        (isTeam ? "Shared team library" : normalizedPublic.topicScope.trim().slice(0, 120) || "Personal library"),
      coverVariant,
      category: mode!.category,
      teamSettings: isTeam
        ? {
            isPrivate: false,
            joinMode,
            memberPermissions: memberPerms,
            recommendedQuestions: questions,
          }
        : undefined,
      publicSettings: normalizedPublic,
    })
    onClose()
  }

  const addQuestion = () => {
    const q = questionDraft.trim()
    if (!q) return
    setQuestions((prev) => [...prev, q])
    setQuestionDraft("")
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="create-kb-title"
        className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-stone-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isTeam ? (
                  <Users className="h-4 w-4 shrink-0 text-mind" strokeWidth={1.75} />
                ) : (
                  <FolderPlus className="h-4 w-4 shrink-0 text-mind" strokeWidth={1.75} />
                )}
                <h2 id="create-kb-title" className="text-[17px] font-semibold text-zinc-800">
                  {title}
                </h2>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 hover:bg-stone-100 hover:text-zinc-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex gap-1 overflow-x-auto pb-0.5">
            {wizardSteps.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (i < stepIndex) setStepIndex(i)
                }}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  i === stepIndex
                    ? "bg-mind text-white"
                    : i < stepIndex
                      ? "bg-mind/10 text-mind hover:bg-mind/15"
                      : "bg-stone-100 text-zinc-400"
                )}
              >
                <span className="tabular-nums">{i + 1}</span>
                {stepLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {currentStep === "library" ? (
            <div className="space-y-4">
              <WebCreateKbAiBar
                label="Smart fill library details"
                hint="Drafts the about text and picks a cover from your title — you can edit before continuing."
                loading={aiBusy === "library"}
                disabled={!name.trim()}
                onClick={() =>
                  runAiAssist(
                    "library",
                    () => {
                      if (!aiCtx) return
                      setDescription((d) => d.trim() || generateLibraryDescription(aiCtx))
                      setCoverVariant(suggestCoverVariant(aiCtx.name, aiCtx.description))
                    },
                    "Library details ready"
                  )
                }
              />
              <label className="block">
                <span className="text-[14px] font-medium text-zinc-700">
                  Library name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isTeam ? "e.g. Engineering playbooks" : "e.g. Product research"}
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-mind/20"
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="text-[14px] font-medium text-zinc-700">
                  About this library{isTeam ? " *" : ""}
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isTeam
                      ? "Who is this for, what sources belong here, and how should teammates use it?"
                      : "Optional — shown in the library header"
                  }
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-mind/20"
                />
              </label>
              <div>
                <span className="text-[14px] font-medium text-zinc-700">Cover</span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-[10px] font-medium text-zinc-500 hover:bg-stone-100"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Upload
                  </button>
                  {LIBRARY_COVER_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCoverVariant(p.variant)}
                      className={cn(
                        "aspect-square overflow-hidden rounded-xl ring-2 ring-offset-1",
                        coverVariant === p.variant ? "ring-mind" : "ring-transparent"
                      )}
                      aria-label={p.label}
                    >
                      <LibraryCover name={p.label} coverVariant={p.variant} showMiniUi />
                    </button>
                  ))}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() =>
                    toast.message("Cover upload", { description: "Custom cover saved (demo)." })
                  }
                />
              </div>
            </div>
          ) : null}

          {currentStep === "access" ? (
            <div className="space-y-4">
              <p className="text-[12px] leading-relaxed text-zinc-500">
                Control how teammates discover and use this shared library.
              </p>
              <label className="block">
                <span className="text-[14px] font-medium text-zinc-700">Join method</span>
                <select
                  value={joinMode}
                  onChange={(e) => setJoinMode(e.target.value as TeamJoinMode)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-mind/20"
                >
                  {JOIN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[14px] font-medium text-zinc-700">Member permissions</span>
                <select
                  value={memberPerms}
                  onChange={(e) => setMemberPerms(e.target.value as TeamMemberPermissions)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-mind/20"
                >
                  {PERM_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-medium text-zinc-700">Team starter questions</span>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1 text-[13px] font-semibold text-mind hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
                <input
                  type="text"
                  value={questionDraft}
                  onChange={(e) => setQuestionDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQuestion())}
                  placeholder="Suggested prompts for teammates"
                  className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-mind/20"
                />
                {questions.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {questions.map((q, i) => (
                      <li
                        key={`${q}-${i}`}
                        className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 text-[13px]"
                      >
                        <span className="min-w-0 flex-1 truncate">{q}</span>
                        <button
                          type="button"
                          className="text-[12px] text-zinc-400 hover:text-red-600"
                          onClick={() => setQuestions((prev) => prev.filter((_, j) => j !== i))}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : null}

          {agentStepFromWizard(currentStep) ? (
            <div className="space-y-4">
              {currentStep === "agent-identity" ? (
                <WebCreateKbAiBar
                  label="Generate assistant profile"
                  hint="Fills display name, tagline, scope, skills, starters, and disclaimer from your library."
                  loading={aiBusy === "agent"}
                  disabled={!name.trim()}
                  onClick={() =>
                    runAiAssist(
                      "agent",
                      () => {
                        if (!aiCtx) return
                        setPublicSettings((prev) =>
                          normalizePublicKbSettings(
                            generateAgentProfileFromLibrary(aiCtx, prev)
                          )
                        )
                      },
                      "Assistant profile generated"
                    )
                  }
                />
              ) : null}
              {currentStep === "agent-behavior" && publicSettings.skills.length < 2 ? (
                <WebCreateKbAiBar
                  variant="subtle"
                  label="Suggest skills from library"
                  loading={aiBusy === "skills"}
                  disabled={!name.trim()}
                  onClick={() =>
                    runAiAssist(
                      "skills",
                      () => {
                        if (!aiCtx) return
                        setPublicSettings((prev) =>
                          normalizePublicKbSettings(
                            generateAgentProfileFromLibrary(aiCtx, prev)
                          )
                        )
                      },
                      "Skills added"
                    )
                  }
                />
              ) : null}
              <WebLibraryAgentFields
                step={agentStepFromWizard(currentStep)!}
                value={publicSettings}
                onChange={setPublicSettings}
                agents={bindableAgents}
                showPlazaCapabilities={publicSettings.isPublic}
              />
            </div>
          ) : null}

          {currentStep === "publish" ? (
            <div className="space-y-4">
              <WebCreateKbAiBar
                label="Publish to plaza with AI polish"
                hint="Turns on public listing and fills capability tags, tagline, and sync metadata."
                loading={aiBusy === "plaza"}
                disabled={!name.trim()}
                onClick={() =>
                  runAiAssist(
                    "plaza",
                    () => {
                      if (!aiCtx) return
                      setPublicSettings((prev) =>
                        normalizePublicKbSettings(polishPlazaListing(aiCtx, prev))
                      )
                    },
                    "Plaza listing ready — review tags below"
                  )
                }
              />
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <input
                  type="checkbox"
                  checked={publicSettings.isPublic}
                  onChange={(e) => {
                    const isPublic = e.target.checked
                    setPublicSettings((prev) =>
                      normalizePublicKbSettings({
                        ...prev,
                        isPublic,
                      })
                    )
                  }}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-mind focus:ring-mind/30"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-zinc-800">
                    Publish to library plaza
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-zinc-500">
                    List publicly with your configured assistant. Subscribers get grounded Q&A scoped
                    to this library. You can stay private and still use the assistant in your workspace.
                  </span>
                </span>
              </label>
              {publicSettings.isPublic ? (
                <WebLibraryAgentFields
                  step="behavior"
                  value={publicSettings}
                  onChange={setPublicSettings}
                  agents={bindableAgents}
                  showPlazaCapabilities
                />
              ) : (
                <p className="text-[12px] text-zinc-500">
                  Your library assistant is already configured and will work in the workspace. Turn on
                  publishing when you are ready to share in the plaza.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-stone-100 px-5 py-4">
          <button
            type="button"
            onClick={() => (stepIndex > 0 ? setStepIndex((i) => i - 1) : onClose())}
            className="rounded-xl px-4 py-2.5 text-[14px] font-semibold text-zinc-600 hover:bg-stone-100"
          >
            {stepIndex > 0 ? "Back" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={goNext}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white",
              web.kbPrimaryBtn
            )}
          >
            {isLastStep ? (isEdit ? "Save library" : "Create library") : "Continue"}
            {!isLastStep ? <ChevronRight className="h-4 w-4" strokeWidth={2} /> : null}
          </button>
        </div>
      </div>
    </div>
  )
}

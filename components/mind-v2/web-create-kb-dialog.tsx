"use client"

import { useEffect, useRef, useState } from "react"
import { FolderPlus, ImagePlus, Plus, X } from "lucide-react"
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
import { DEFAULT_PUBLIC_KB_SETTINGS, type PublicKbSettings } from "@/lib/public-kb-settings"
import {
  WebPublicKbSettingsFields,
  normalizePublicKbSettings,
  validatePublicKbSettings,
} from "@/components/mind-v2/web-public-kb-settings-fields"
import { publicAgentDisplayName } from "@/lib/public-kb-settings"

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

const JOIN_OPTIONS: { value: TeamJoinMode; label: string }[] = [
  { value: "Open join", label: "Join directly" },
  { value: "Admin approval", label: "Requires approval" },
]

const PERM_OPTIONS: { value: TeamMemberPermissions; label: string }[] = [
  { value: "View & export", label: "View and export content" },
  { value: "View only", label: "View only" },
]

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
  /** Agents available when publishing a public knowledge base */
  bindableAgents?: Agent[]
}) {
  const isTeam = mode?.category === "team"
  const isEdit = mode?.kind === "edit"
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [coverVariant, setCoverVariant] = useState<LibraryCoverVariant>("product")
  const [joinMode, setJoinMode] = useState<TeamJoinMode>("Open join")
  const [memberPerms, setMemberPerms] = useState<TeamMemberPermissions>("View & export")
  const [questions, setQuestions] = useState<string[]>([])
  const [questionDraft, setQuestionDraft] = useState("")
  const [publicSettings, setPublicSettings] = useState<PublicKbSettings>({ ...DEFAULT_PUBLIC_KB_SETTINGS })

  useEffect(() => {
    if (!open || !mode) return
    setName(initial?.name ?? "")
    setDescription(initial?.description ?? "")
    setCoverVariant(initial?.coverVariant ?? "product")
    const ts = initial?.teamSettings ?? DEFAULT_TEAM_LIBRARY_SETTINGS
    setJoinMode(ts.joinMode)
    setMemberPerms(ts.memberPermissions)
    setQuestions(ts.recommendedQuestions ?? [])
    setQuestionDraft("")
    setPublicSettings(normalizePublicKbSettings(initial?.publicSettings))
  }, [open, mode, initial])

  if (!open || !mode) return null

  const canSubmit = name.trim().length > 0
  const title = isEdit
    ? isTeam
      ? "Edit shared library"
      : "Edit personal library"
    : isTeam
      ? "Create shared library"
      : "Create personal library"

  const submit = () => {
    if (!canSubmit) return
    const normalizedPublic = normalizePublicKbSettings(publicSettings)
    const pubError = validatePublicKbSettings(normalizedPublic)
    if (pubError) {
      toast.error(pubError)
      return
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      coverVariant,
      category: mode.category,
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
      <button type="button" className="absolute inset-0 bg-black/35" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="create-kb-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-zinc-600" strokeWidth={1.75} />
            <h2 id="create-kb-title" className="text-[17px] font-semibold text-zinc-800">
              {title}
            </h2>
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

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <label className="mb-4 block">
            <span className="text-[14px] font-medium text-zinc-700">
              Name <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter library name"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
              autoFocus
            />
          </label>

          <div className="mb-4">
            <span className="text-[14px] font-medium text-zinc-700">Cover</span>
            {isTeam && !isEdit ? (
              <div className="relative mt-2 inline-block">
                <div className="h-24 w-24 overflow-hidden rounded-2xl ring-1 ring-stone-200">
                  <LibraryCover name={name || "Library"} coverVariant={coverVariant} showMiniUi={false} />
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-stone-200"
                  aria-label="Change cover"
                >
                  <ImagePlus className="h-4 w-4 text-zinc-600" />
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  {LIBRARY_COVER_PRESETS.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCoverVariant(p.variant)}
                      className={cn(
                        "h-9 w-9 overflow-hidden rounded-lg ring-2 ring-offset-1",
                        coverVariant === p.variant ? "ring-zinc-800" : "ring-transparent"
                      )}
                    >
                      <LibraryCover name={p.label} coverVariant={p.variant} showMiniUi={false} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-[11px] font-medium text-zinc-500 hover:bg-stone-100"
                >
                  <ImagePlus className="h-5 w-5" />
                  Upload
                </button>
                {LIBRARY_COVER_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCoverVariant(p.variant)}
                    className={cn(
                      "aspect-square overflow-hidden rounded-xl ring-2 ring-offset-1 transition-transform hover:scale-[1.02]",
                      coverVariant === p.variant ? "ring-zinc-800" : "ring-transparent"
                    )}
                    aria-label={p.label}
                  >
                    <LibraryCover name={p.label} coverVariant={p.variant} showMiniUi={false} />
                  </button>
                ))}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => toast.message("Cover upload", { description: "Custom cover saved (demo)." })}
            />
          </div>

          {isTeam ? (
            <>
              <label className="mb-4 block">
                <span className="text-[14px] font-medium text-zinc-700">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this shared library"
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-[14px] text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="mb-4 block">
                <span className="text-[14px] font-medium text-zinc-700">Join method</span>
                <select
                  value={joinMode}
                  onChange={(e) => setJoinMode(e.target.value as TeamJoinMode)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] text-zinc-800 outline-none focus:border-teal-300"
                >
                  {JOIN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mb-4 block">
                <span className="text-[14px] font-medium text-zinc-700">Member permissions</span>
                <select
                  value={memberPerms}
                  onChange={(e) => setMemberPerms(e.target.value as TeamMemberPermissions)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] text-zinc-800 outline-none focus:border-teal-300"
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
                  <span className="text-[14px] font-medium text-zinc-700">Recommended questions</span>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1 text-[13px] font-semibold text-mind hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add question
                  </button>
                </div>
                <input
                  type="text"
                  value={questionDraft}
                  onChange={(e) => setQuestionDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQuestion())}
                  placeholder="Preset questions for this library"
                  className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-[14px] outline-none placeholder:text-zinc-400 focus:border-teal-300"
                />
                {questions.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {questions.map((q, i) => (
                      <li
                        key={`${q}-${i}`}
                        className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 text-[13px] text-zinc-700"
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
            </>
          ) : (
            <label className="block">
              <span className="text-[14px] font-medium text-zinc-700">About</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
                className="mt-1.5 w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-[14px] text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-teal-300"
              />
            </label>
          )}

          <WebPublicKbSettingsFields
            value={publicSettings}
            onChange={setPublicSettings}
            agents={bindableAgents}
          />
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-stone-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-stone-100 px-5 py-2.5 text-[14px] font-semibold text-zinc-700 hover:bg-stone-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className={cn(
              "rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white",
              canSubmit ? "bg-zinc-800 hover:bg-zinc-900" : "cursor-not-allowed bg-stone-300"
            )}
          >
            {isEdit ? "Save" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  )
}

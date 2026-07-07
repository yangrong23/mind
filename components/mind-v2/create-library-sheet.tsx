"use client"

import { useEffect, useState } from "react"
import { ChevronRight, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { LibraryCover } from "@/components/mind-v2/library-cover"
import { LIBRARY_COVER_PRESETS } from "@/lib/library-cover-presets"
import type { LibraryCoverVariant } from "@/lib/product-media"
import type { KBCategory, TeamJoinMode, TeamLibrarySettings, TeamMemberPermissions } from "@/lib/mock-knowledge-bases"
import { DEFAULT_TEAM_LIBRARY_SETTINGS } from "@/lib/mock-knowledge-bases"

const JOIN_OPTIONS: { value: TeamJoinMode; label: string }[] = [
  { value: "Open join", label: "Open join" },
  { value: "Admin approval", label: "Admin approval" },
]

const PERM_OPTIONS: { value: TeamMemberPermissions; label: string }[] = [
  { value: "View & export", label: "View and export" },
  { value: "View only", label: "View only" },
]

export type CreateLibraryPayload = {
  name: string
  description: string
  color: string
  coverVariant?: LibraryCoverVariant
  category: KBCategory
  teamSettings?: TeamLibrarySettings
}

export interface CreateLibrarySheetProps {
  open: boolean
  category: "mine" | "team"
  onClose: () => void
  onCreate: (payload: CreateLibraryPayload) => void
}

function OptionPickerSheet<T extends string>({
  open,
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  open: boolean
  title: string
  options: { value: T; label: string }[]
  value: T
  onSelect: (v: T) => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-zinc-900/35" aria-label="Close" onClick={onClose} />
      <div className="relative rounded-t-2xl bg-white pb-[max(1rem,env(safe-area-inset-bottom))] dark:bg-zinc-900">
        <p className="border-b border-zinc-100 px-5 py-3 text-center text-[15px] font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
          {title}
        </p>
        <ul>
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onSelect(opt.value)
                  onClose()
                }}
                className={cn(
                  "flex w-full items-center justify-between px-5 py-3.5 text-[16px]",
                  value === opt.value ? "font-semibold text-mind" : "text-zinc-800 dark:text-zinc-200"
                )}
              >
                {opt.label}
                {value === opt.value ? <span className="text-[13px] text-mind">Selected</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CreateLibraryPage({
  category,
  onClose,
  onCreate,
}: {
  category: "mine" | "team"
  onClose: () => void
  onCreate: (payload: CreateLibraryPayload) => void
}) {
  const isTeam = category === "team"
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [coverVariant, setCoverVariant] = useState<LibraryCoverVariant>("product")
  const [showCoverPicker, setShowCoverPicker] = useState(false)
  const [joinMode, setJoinMode] = useState<TeamJoinMode>(DEFAULT_TEAM_LIBRARY_SETTINGS.joinMode)
  const [memberPerms, setMemberPerms] = useState<TeamMemberPermissions>(
    DEFAULT_TEAM_LIBRARY_SETTINGS.memberPermissions
  )
  const [questions, setQuestions] = useState<string[]>([])
  const [questionDraft, setQuestionDraft] = useState("")
  const [picker, setPicker] = useState<"join" | "perm" | null>(null)

  const canSubmit = name.trim().length > 0
  const joinLabel = JOIN_OPTIONS.find((o) => o.value === joinMode)?.label ?? joinMode
  const permLabel = PERM_OPTIONS.find((o) => o.value === memberPerms)?.label ?? memberPerms
  const title = isTeam ? "Create team library" : "Create personal library"

  const addQuestion = () => {
    const q = questionDraft.trim()
    if (!q) return
    setQuestions((prev) => [...prev, q])
    setQuestionDraft("")
  }

  const submit = () => {
    if (!canSubmit) return
    onCreate({
      name: name.trim(),
      description: description.trim() || (isTeam ? "Team shared library" : "Personal library"),
      color: "from-zinc-500 to-zinc-600",
      coverVariant,
      category,
      teamSettings: isTeam
        ? {
            isPrivate: false,
            joinMode,
            memberPermissions: memberPerms,
            recommendedQuestions: questions,
          }
        : undefined,
    })
    onClose()
  }

  return (
    <div className="absolute inset-0 z-[55] flex flex-col bg-[#f5f5f5] font-sans dark:bg-zinc-950">
      <div className="flex shrink-0 items-center justify-between border-b border-stone-200/80 bg-[#f5f5f5] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] dark:border-zinc-800 dark:bg-zinc-950">
        <button type="button" onClick={onClose} className="min-w-[3rem] text-left text-[16px] text-zinc-700 dark:text-zinc-300">
          Cancel
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className={cn(
            "min-w-[3rem] text-right text-[16px] font-semibold",
            canSubmit ? "text-mind" : "text-zinc-400"
          )}
        >
          Create
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-zinc-900">
          <label className="flex items-center gap-3 border-b border-stone-100 px-4 py-3.5 dark:border-zinc-800">
            <span className="shrink-0 text-[16px] text-zinc-900 dark:text-zinc-100">
              Name<span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Library name"
              className="min-w-0 flex-1 border-0 bg-transparent text-[16px] text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
              autoFocus
            />
          </label>

          <button
            type="button"
            onClick={() => setShowCoverPicker((v) => !v)}
            className="flex w-full items-center gap-3 border-b border-stone-100 px-4 py-3.5 text-left dark:border-zinc-800"
          >
            <span className="shrink-0 text-[16px] text-zinc-900 dark:text-zinc-100">Cover</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="h-11 w-11 overflow-hidden rounded-lg ring-1 ring-stone-200/90 dark:ring-zinc-700">
                <LibraryCover name={name || "Library"} coverVariant={coverVariant} showMiniUi={false} />
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={1.75} />
            </div>
          </button>

          {showCoverPicker ? (
            <div className="border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
              <div className="flex flex-wrap gap-2.5">
                {LIBRARY_COVER_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCoverVariant(p.variant)}
                    className={cn(
                      "h-12 w-12 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900",
                      coverVariant === p.variant ? "ring-zinc-900 dark:ring-zinc-100" : "ring-transparent"
                    )}
                    aria-label={p.label}
                  >
                    <LibraryCover name={p.label} coverVariant={p.variant} showMiniUi={false} />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <label className="block px-4 py-3.5">
            <span className="text-[16px] text-zinc-900 dark:text-zinc-100">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isTeam ? "Describe this team library" : "Describe this personal library"}
              rows={3}
              className="mt-2 w-full resize-none border-0 bg-transparent text-[16px] leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            />
          </label>
        </div>

        {isTeam ? (
          <>
            <div className="mt-3 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setPicker("join")}
                className="flex w-full items-center justify-between gap-3 border-b border-stone-100 px-4 py-3.5 text-left dark:border-zinc-800"
              >
                <span className="text-[16px] text-zinc-900 dark:text-zinc-100">Join method</span>
                <span className="flex min-w-0 items-center gap-1 text-[16px] text-zinc-500 dark:text-zinc-400">
                  <span className="truncate">{joinLabel}</span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" strokeWidth={1.75} />
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPicker("perm")}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-[16px] text-zinc-900 dark:text-zinc-100">Member permissions</span>
                <span className="flex min-w-0 items-center gap-1 text-[16px] text-zinc-500 dark:text-zinc-400">
                  <span className="truncate">{permLabel}</span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" strokeWidth={1.75} />
                </span>
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl bg-white px-4 py-3.5 dark:bg-zinc-900">
              <p className="text-[16px] text-zinc-900 dark:text-zinc-100">Suggested questions</p>
              <input
                type="text"
                value={questionDraft}
                onChange={(e) => setQuestionDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addQuestion()
                  }
                }}
                placeholder="Add a suggested question for this library"
                className="mt-2 w-full border-0 bg-transparent text-[16px] text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
              />
              {questions.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {questions.map((q, i) => (
                    <li
                      key={`${q}-${i}`}
                      className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 text-[14px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      <span className="min-w-0 flex-1">{q}</span>
                      <button
                        type="button"
                        className="shrink-0 text-[13px] text-zinc-400"
                        onClick={() => setQuestions((prev) => prev.filter((_, j) => j !== i))}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                onClick={addQuestion}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-stone-200 py-2.5 text-[15px] font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                Add question
              </button>
            </div>
          </>
        ) : null}
      </div>

      {isTeam ? (
        <>
          <OptionPickerSheet
            open={picker === "join"}
            title="Join method"
            options={JOIN_OPTIONS}
            value={joinMode}
            onSelect={setJoinMode}
            onClose={() => setPicker(null)}
          />
          <OptionPickerSheet
            open={picker === "perm"}
            title="Member permissions"
            options={PERM_OPTIONS}
            value={memberPerms}
            onSelect={setMemberPerms}
            onClose={() => setPicker(null)}
          />
        </>
      ) : null}
    </div>
  )
}

export function CreateLibrarySheet({ open, category, onClose, onCreate }: CreateLibrarySheetProps) {
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    if (open) setResetKey((k) => k + 1)
  }, [open, category])

  if (!open) return null

  return <CreateLibraryPage key={resetKey} category={category} onClose={onClose} onCreate={onCreate} />
}

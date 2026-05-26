"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import { LibraryCover } from "@/components/mind-v2/library-cover"
import type { LibraryCoverVariant } from "@/lib/product-media"
import {
  DEFAULT_TEAM_LIBRARY_SETTINGS,
  type TeamJoinMode,
  type TeamLibrarySettings,
  type TeamMemberPermissions,
} from "@/lib/mock-knowledge-bases"

function rowClass() {
  return "flex w-full items-center justify-between gap-3 border-b border-zinc-100/95 px-4 py-3.5 text-left last:border-b-0 active:bg-zinc-50/80 dark:border-zinc-800 dark:active:bg-zinc-800/40"
}

export type TeamFieldEdit = "name" | "description" | "recommended" | "permissions" | "join" | null

const MEMBER_PERMISSIONS: TeamMemberPermissions[] = ["View & export", "View only"]
const JOIN_MODES: TeamJoinMode[] = ["Open join", "Admin approval"]

export function TeamKbInfoOverlay({
  open,
  onClose,
  name,
  description,
  coverVariant,
  colorClass,
  settings: settingsProp,
  onSettingsChange,
  onNameChange,
  onDescriptionChange,
  initialField = null,
}: {
  open: boolean
  onClose: () => void
  name: string
  description?: string
  coverVariant?: LibraryCoverVariant
  colorClass?: string
  settings?: TeamLibrarySettings
  onSettingsChange?: (next: TeamLibrarySettings) => void
  onNameChange?: (name: string) => void
  onDescriptionChange?: (description: string) => void
  /** Open directly on a sub-screen (e.g. permissions from overflow menu). */
  initialField?: TeamFieldEdit
}) {
  const [localSettings, setLocalSettings] = useState<TeamLibrarySettings>(DEFAULT_TEAM_LIBRARY_SETTINGS)
  const [fieldEdit, setFieldEdit] = useState<TeamFieldEdit>(null)
  const [draftName, setDraftName] = useState(name)
  const [draftDescription, setDraftDescription] = useState(description ?? "")
  const [draftQuestion, setDraftQuestion] = useState("")

  const settings = settingsProp ?? localSettings
  const patchSettings = (patch: Partial<TeamLibrarySettings>) => {
    const next = { ...settings, ...patch }
    if (onSettingsChange) onSettingsChange(next)
    else setLocalSettings(next)
  }

  useEffect(() => {
    if (!open) {
      setFieldEdit(null)
      return
    }
    setDraftName(name)
    setDraftDescription(description ?? "")
    if (settingsProp) setLocalSettings(settingsProp)
    setFieldEdit(initialField ?? null)
  }, [open, name, description, settingsProp, initialField])

  if (!open) return null

  const KbIcon = knowledgeBaseIconForTitle(name, description)
  const card = "mb-3 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
  const recommendedLabel =
    settings.recommendedQuestions.length > 0
      ? `${settings.recommendedQuestions.length} question${settings.recommendedQuestions.length === 1 ? "" : "s"}`
      : "None yet"

  if (fieldEdit === "name" || fieldEdit === "description") {
    const isName = fieldEdit === "name"
    return (
      <div className="absolute inset-0 z-[70] flex min-h-0 flex-col bg-[#f2f2f3] dark:bg-zinc-950">
        <header className="flex shrink-0 items-center border-b border-zinc-200/80 bg-white px-1 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => setFieldEdit(null)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">
            {isName ? "Name" : "Description"}
          </h1>
          <button
            type="button"
            className="mr-1 shrink-0 px-2 py-1 text-[15px] font-medium text-mind disabled:text-zinc-300"
            disabled={isName && !draftName.trim()}
            onClick={() => {
              if (isName) {
                onNameChange?.(draftName.trim())
                toast.success("Name updated")
              } else {
                onDescriptionChange?.(draftDescription.trim())
                toast.success("Description updated")
              }
              setFieldEdit(null)
            }}
          >
            Save
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isName ? (
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[16px] text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              autoFocus
            />
          ) : (
            <textarea
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[16px] leading-relaxed text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              autoFocus
            />
          )}
        </div>
      </div>
    )
  }

  if (fieldEdit === "recommended") {
    return (
      <div className="absolute inset-0 z-[70] flex min-h-0 flex-col bg-[#f2f2f3] dark:bg-zinc-950">
        <header className="flex shrink-0 items-center border-b border-zinc-200/80 bg-white px-1 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => setFieldEdit(null)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">
            Recommended questions
          </h1>
          <div className="h-10 w-10 shrink-0" aria-hidden />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-3 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            {settings.recommendedQuestions.length === 0 ? (
              <p className="px-4 py-6 text-center text-[14px] text-zinc-500">
                None yet — add prompts teammates see when they open this library.
              </p>
            ) : (
              settings.recommendedQuestions.map((q, i) => (
                <div
                  key={`${i}-${q.slice(0, 12)}`}
                  className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800"
                >
                  <span className="min-w-0 flex-1 text-[15px] text-zinc-800 dark:text-zinc-100">{q}</span>
                  <button
                    type="button"
                    className="shrink-0 text-[13px] text-red-600"
                    onClick={() =>
                      patchSettings({
                        recommendedQuestions: settings.recommendedQuestions.filter((_, j) => j !== i),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={draftQuestion}
              onChange={(e) => setDraftQuestion(e.target.value)}
              placeholder="Add a suggested question"
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              type="button"
              disabled={!draftQuestion.trim()}
              onClick={() => {
                patchSettings({
                  recommendedQuestions: [...settings.recommendedQuestions, draftQuestion.trim()],
                })
                setDraftQuestion("")
              }}
              className="shrink-0 rounded-xl bg-zinc-900 px-4 py-3 text-[15px] font-medium text-white disabled:bg-zinc-200 disabled:text-zinc-400 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (fieldEdit === "permissions" || fieldEdit === "join") {
    const options = fieldEdit === "permissions" ? MEMBER_PERMISSIONS : JOIN_MODES
    const current = fieldEdit === "permissions" ? settings.memberPermissions : settings.joinMode
    const title = fieldEdit === "permissions" ? "Member permissions" : "How to join"
    return (
      <div className="absolute inset-0 z-[70] flex min-h-0 flex-col bg-[#f2f2f3] dark:bg-zinc-950">
        <header className="flex shrink-0 items-center border-b border-zinc-200/80 bg-white px-1 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => setFieldEdit(null)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          <div className="h-10 w-10 shrink-0" aria-hidden />
        </header>
        <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn(rowClass(), current === opt && "bg-zinc-50 dark:bg-zinc-800/50")}
              onClick={() => {
                if (fieldEdit === "permissions") {
                  patchSettings({ memberPermissions: opt as TeamMemberPermissions })
                } else {
                  patchSettings({ joinMode: opt as TeamJoinMode })
                }
                toast.success("Updated")
                setFieldEdit(null)
              }}
            >
              <span className="text-[15px] text-zinc-900 dark:text-zinc-100">{opt}</span>
              {current === opt ? <span className="text-[13px] font-medium text-mind">Selected</span> : null}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-[70] flex min-h-0 flex-col bg-[#f2f2f3] dark:bg-zinc-950">
      <header className="flex shrink-0 items-center border-b border-zinc-200/80 bg-white px-1 py-2 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">
          Library information
        </h1>
        <div className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className={card}>
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Members", { description: "Manage members (demo)." })}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Members</span>
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                U
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Requests", { description: "Review join requests (demo)." })}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Requests</span>
            <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2} />
          </button>
        </div>

        <div className={card}>
          <button type="button" className={rowClass()} onClick={() => setFieldEdit("name")}>
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Name</span>
            <span className="flex min-w-0 items-center gap-1 text-[14px] text-zinc-400">
              <span className="truncate">{name}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Cover", { description: "Change cover image (demo)." })}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Cover</span>
            <span className="flex items-center gap-2">
              {coverVariant ? (
                <div className="h-10 w-10 overflow-hidden rounded-lg ring-1 ring-black/[0.06]">
                  <LibraryCover name={name} coverVariant={coverVariant} showMiniUi={false} />
                </div>
              ) : (
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-black/[0.06]",
                    colorClass || "from-zinc-600 to-zinc-700"
                  )}
                >
                  <KbIcon className="h-5 w-5 text-white" strokeWidth={1.65} aria-hidden />
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button type="button" className={rowClass()} onClick={() => setFieldEdit("description")}>
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Description</span>
            <span className="flex min-w-0 max-w-[55%] items-center gap-1 text-[14px] text-zinc-400">
              <span className="truncate">{description || "—"}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button type="button" className={rowClass()} onClick={() => setFieldEdit("recommended")}>
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Recommended questions</span>
            <span className="flex items-center gap-1 text-[14px] text-zinc-400">
              {recommendedLabel}
              <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
        </div>

        <div className={card}>
          <div className="flex items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">Private library</p>
              <p className="mt-1 text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">
                When on, only you can see this library.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.isPrivate}
              onClick={() => patchSettings({ isPrivate: !settings.isPrivate })}
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                settings.isPrivate ? "bg-mind/48" : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                  settings.isPrivate ? "left-5" : "left-0.5"
                )}
              />
            </button>
          </div>
        </div>

        <div className={card}>
          <button type="button" className={rowClass()} onClick={() => setFieldEdit("permissions")}>
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Member permissions</span>
            <span className="flex items-center gap-1 text-[13px] text-zinc-400">
              <span className="max-w-[10rem] truncate">{settings.memberPermissions}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button type="button" className={rowClass()} onClick={() => setFieldEdit("join")}>
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">How to join</span>
            <span className="flex items-center gap-1 text-[13px] text-zinc-400">
              <span className="max-w-[10rem] truncate">{settings.joinMode}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            toast.message("Delete library", { description: "Would remove after confirmation (demo)." })
            onClose()
          }}
          className="w-full rounded-2xl border border-zinc-200/80 bg-white py-3.5 text-center text-[15px] font-medium text-red-600 shadow-sm active:bg-red-50 dark:border-zinc-700 dark:bg-zinc-900 dark:active:bg-red-950/30"
        >
          Delete library
        </button>
      </div>
    </div>
  )
}

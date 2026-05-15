"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"

function rowClass() {
  return "flex w-full items-center justify-between gap-3 border-b border-zinc-100/95 px-4 py-3.5 text-left last:border-b-0 active:bg-zinc-50/80 dark:border-zinc-800 dark:active:bg-zinc-800/40"
}

export function PersonalKbInfoOverlay({
  open,
  onClose,
  name,
  description,
  coverImage,
  colorClass,
}: {
  open: boolean
  onClose: () => void
  name: string
  description?: string
  coverImage?: string
  colorClass?: string
}) {
  if (!open) return null
  const KbIcon = knowledgeBaseIconForTitle(name, description)

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
        <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Name", { description: "Rename library (demo)." })}
          >
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
              {coverImage ? (
                <img src={coverImage} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover ring-1 ring-black/[0.06]" />
              ) : (
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-black/[0.06]",
                    colorClass || "from-teal-500 to-cyan-600"
                  )}
                >
                  <KbIcon className="h-5 w-5 text-white" strokeWidth={1.65} aria-hidden />
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            toast.message("Delete library", { description: "Would remove this library after confirmation (demo)." })
            onClose()
          }}
          className="mt-4 w-full rounded-2xl border border-zinc-200/80 bg-white py-3.5 text-center text-[15px] font-medium text-red-600 shadow-sm active:bg-red-50 dark:border-zinc-700 dark:bg-zinc-900 dark:active:bg-red-950/30"
        >
          Delete library
        </button>
      </div>
    </div>
  )
}

export function TeamKbInfoOverlay({
  open,
  onClose,
  name,
  description,
  coverImage,
  colorClass,
}: {
  open: boolean
  onClose: () => void
  name: string
  description?: string
  coverImage?: string
  colorClass?: string
}) {
  const [isPrivate, setIsPrivate] = useState(false)
  const [memberPerm, setMemberPerm] = useState("View & export")
  const [joinMode, setJoinMode] = useState("Admin approval")

  if (!open) return null
  const KbIcon = knowledgeBaseIconForTitle(name, description)

  const card = "mb-3 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"

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
          <button type="button" className={rowClass()} onClick={() => toast.message("Name", { description: "Edit name (demo)." })}>
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Name</span>
            <span className="flex min-w-0 items-center gap-1 text-[14px] text-zinc-400">
              <span className="truncate">{name}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button type="button" className={rowClass()} onClick={() => toast.message("Cover", { description: "Change cover (demo)." })}>
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Cover</span>
            <span className="flex items-center gap-2">
              {coverImage ? (
                <img src={coverImage} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover ring-1 ring-black/[0.06]" />
              ) : (
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-black/[0.06]",
                    colorClass || "from-sky-500 to-indigo-600"
                  )}
                >
                  <KbIcon className="h-5 w-5 text-white" strokeWidth={1.65} aria-hidden />
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button type="button" className={rowClass()} onClick={() => toast.message("Description", { description: "Edit description (demo)." })}>
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Description</span>
            <span className="flex min-w-0 max-w-[55%] items-center gap-1 text-[14px] text-zinc-400">
              <span className="truncate">{description || "—"}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Recommended questions", { description: "Add suggested prompts (demo)." })}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Recommended questions</span>
            <span className="flex items-center gap-1 text-[14px] text-zinc-400">
              None yet
              <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
        </div>

        <div className={card}>
          <div className="flex items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">Private library</p>
              <p className="mt-1 text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">When on, only you can see this library.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPrivate}
              onClick={() => setIsPrivate((v) => !v)}
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                isPrivate ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                  isPrivate ? "left-5" : "left-0.5"
                )}
              />
            </button>
          </div>
        </div>

        <div className={card}>
          <button
            type="button"
            className={rowClass()}
            onClick={() => {
              setMemberPerm((p) => (p === "View & export" ? "View only" : "View & export"))
              toast.message("Member permissions", { description: "Updated for demo." })
            }}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Member permissions</span>
            <span className="flex items-center gap-1 text-[13px] text-zinc-400">
              <span className="max-w-[10rem] truncate">{memberPerm}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button
            type="button"
            className={rowClass()}
            onClick={() => {
              setJoinMode((j) => (j === "Admin approval" ? "Open join" : "Admin approval"))
              toast.message("Joining", { description: "Updated for demo." })
            }}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">How to join</span>
            <span className="flex items-center gap-1 text-[13px] text-zinc-400">
              <span className="max-w-[10rem] truncate">{joinMode}</span>
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

const SUBSCRIBED_FALLBACK_DETAIL =
  "This library is maintained by its publisher. Updates, sources, and availability follow their policies. You can browse and ask questions while subscribed; unsubscribing removes it from your list (demo)."

export function SubscribedKbInfoOverlay({
  open,
  onClose,
  name,
  description,
  coverImage,
  colorClass,
  onUnsubscribe,
}: {
  open: boolean
  onClose: () => void
  name: string
  description?: string
  coverImage?: string
  colorClass?: string
  onUnsubscribe: () => void
}) {
  if (!open) return null
  const KbIcon = knowledgeBaseIconForTitle(name, description)
  const body = (description && description.trim()) || SUBSCRIBED_FALLBACK_DETAIL

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
        <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Name", { description: "Publisher-managed (demo)." })}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Name</span>
            <span className="flex min-w-0 items-center gap-1 text-[14px] text-zinc-400">
              <span className="truncate">{name}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <button
            type="button"
            className={rowClass()}
            onClick={() => toast.message("Cover", { description: "Publisher cover (demo)." })}
          >
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Cover</span>
            <span className="flex items-center gap-2">
              {coverImage ? (
                <img src={coverImage} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover ring-1 ring-black/[0.06]" />
              ) : (
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-black/[0.06]",
                    colorClass || "from-teal-500 to-cyan-600"
                  )}
                >
                  <KbIcon className="h-5 w-5 text-white" strokeWidth={1.65} aria-hidden />
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2} />
            </span>
          </button>
          <div className="border-b border-zinc-100/95 px-4 py-3.5 last:border-b-0 dark:border-zinc-800">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 text-left active:opacity-80"
              onClick={() => toast.message("Description", { description: "Full text is shown below (demo)." })}
            >
              <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Description</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} aria-hidden />
            </button>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onUnsubscribe()
          }}
          className="mt-4 w-full rounded-2xl border border-zinc-200/80 bg-white py-3.5 text-center text-[15px] font-medium text-red-600 shadow-sm active:bg-red-50 dark:border-zinc-700 dark:bg-zinc-900 dark:active:bg-red-950/30"
        >
          Unsubscribe
        </button>
      </div>
    </div>
  )
}

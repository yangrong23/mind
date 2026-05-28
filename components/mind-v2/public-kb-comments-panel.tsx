"use client"

import { useState } from "react"
import { Send, User } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { PublicKbComment } from "@/lib/plaza-kb-engagement"

export function PublicKbCommentsPanel({
  comments,
  onCommentsChange,
  className,
  compact,
}: {
  comments: PublicKbComment[]
  onCommentsChange: (next: PublicKbComment[]) => void
  className?: string
  /** Tighter padding for sidebar tab */
  compact?: boolean
}) {
  const postComment = (draft: string) => {
    const t = draft.trim()
    if (!t) return
    onCommentsChange([
      { id: `pc-${Date.now()}`, user: "You", meta: "Just now", body: t },
      ...comments,
    ])
    toast.success("Posted", { description: "Comment added to the thread (demo)." })
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div
        className={cn(
          "scrollbar-hide min-h-0 flex-1 overflow-y-auto",
          compact ? "px-3 py-2" : "px-4 py-2"
        )}
      >
        {comments.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-zinc-500">No comments yet. Start the discussion.</p>
        ) : (
          comments.map((c) => <CommentRow key={c.id} comment={c} />)
        )}
      </div>
      <div
        className={cn(
          "shrink-0 border-t border-stone-100 bg-white dark:border-zinc-800 dark:bg-zinc-950",
          compact ? "px-3 py-2.5" : "px-3 py-3"
        )}
      >
        <CommentComposerForm onPost={postComment} />
      </div>
    </div>
  )
}

function CommentRow({ comment: c }: { comment: PublicKbComment }) {
  return (
    <div className="border-b border-stone-100 py-3.5 last:border-b-0 dark:border-zinc-800">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
          <User className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-50">{c.user}</span>
            {c.isAuthor ? (
              <span className="rounded bg-mind/10 px-1.5 py-0.5 text-[10px] font-semibold text-mind dark:bg-mind/20 dark:text-mind">
                Author
              </span>
            ) : null}
            <span className="text-[12px] text-zinc-400">{c.meta}</span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-200">
            {c.body}
          </p>
        </div>
      </div>
    </div>
  )
}

export function CommentComposerForm({ onPost }: { onPost: (text: string) => void }) {
  const [draft, setDraft] = useState("")

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 dark:bg-zinc-700">
        <User className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden />
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onPost(draft)
            setDraft("")
          }
        }}
        placeholder="Write a comment…"
        className="min-h-[40px] flex-1 rounded-full border border-transparent bg-stone-100 px-4 text-[14px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-mind/20 dark:bg-zinc-800 dark:text-zinc-100"
      />
      <button
        type="button"
        disabled={!draft.trim()}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
          draft.trim() ? "text-mind hover:bg-mind/10" : "text-zinc-300"
        )}
        aria-label="Send comment"
        onClick={() => {
          onPost(draft)
          setDraft("")
        }}
      >
        <Send className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  )
}

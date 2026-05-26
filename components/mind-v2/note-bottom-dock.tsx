"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type NoteBottomDockProps = {
  /** Quick-ask chips / cards */
  options?: ReactNode
  /** Format toolbar or @ / upload / voice band */
  edit?: ReactNode
  /** Chat composer (textarea at the bottom of the card) */
  chat: ReactNode
  className?: string
}

/** Note detail & text editor — options → edit → chat (bottom). */
export function NoteBottomDock({ options, edit, chat, className }: NoteBottomDockProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-stone-100/90 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95",
        className
      )}
    >
      {options ? <div className="px-3 pb-2.5 pt-2.5">{options}</div> : null}
      {edit ? (
        <div
          className={cn(
            "border-t border-stone-100/90 px-1 pt-1 dark:border-zinc-800/90",
            options ? "" : "pt-2"
          )}
        >
          {edit}
        </div>
      ) : null}
      <div
        className={cn(
          "px-3 pb-[max(10px,env(safe-area-inset-bottom))]",
          options || edit ? "pt-2" : "pt-2.5"
        )}
      >
        {chat}
      </div>
    </div>
  )
}

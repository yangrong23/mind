"use client"

import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { Layers, Plus, Store } from "lucide-react"

export function LibraryEmptyState({
  variant,
  onCreate,
  onBrowsePlaza,
}: {
  variant: "personal" | "team" | "subscribed"
  onCreate?: () => void
  onBrowsePlaza: () => void
}) {
  const copy =
    variant === "personal"
      ? {
          title: "Start your first library",
          body: "Collect notes, files, and Studio outputs in one place — or discover ready-made libraries in Plaza.",
          primary: "New personal library",
          secondary: "Explore Plaza",
        }
      : variant === "team"
        ? {
            title: "No team libraries yet",
            body: "Create a shared space for your squad, or subscribe to a team library from Plaza.",
            primary: "New team library",
            secondary: "Browse Plaza",
          }
        : {
            title: "Nothing subscribed yet",
            body: "Follow public libraries to get updates, or publish your own to grow an audience.",
            primary: "Browse Plaza",
            secondary: undefined,
          }

  return (
    <div
      className={cn(
        "mx-auto flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-stone-200/90 px-6 py-10 text-center",
        "bg-white dark:border-zinc-700 dark:bg-zinc-900/40"
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mind/10 text-mind">
        <Layers className="h-7 w-7" strokeWidth={1.75} aria-hidden />
      </div>
      <h2 className="mt-4 text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">{copy.title}</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-zinc-500 dark:text-zinc-400">{copy.body}</p>
      <div className="mt-5 flex w-full flex-col gap-2">
        {variant !== "subscribed" && onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold text-white",
              mx.brandCta
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            {copy.primary}
          </button>
        ) : (
          <button
            type="button"
            onClick={onBrowsePlaza}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold text-white",
              mx.brandCta
            )}
          >
            <Store className="h-4 w-4" strokeWidth={2} aria-hidden />
            {copy.primary}
          </button>
        )}
        {copy.secondary ? (
          <button
            type="button"
            onClick={onBrowsePlaza}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200/90 py-3 text-[14px] font-medium text-zinc-700 hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Store className="h-4 w-4 text-mind" strokeWidth={2} aria-hidden />
            {copy.secondary}
          </button>
        ) : null}
      </div>
    </div>
  )
}

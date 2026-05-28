"use client"

import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { factoryKindShortLabel } from "@/components/mind-v2/content-factory-progress-panel"
import type { PublicFactoryOutput } from "@/lib/public-factory-outputs"
import { StudioOutputListRow } from "@/components/mind-v2/studio-output-row"
import { toast } from "sonner"

export function WebPublicFactoryGallery({
  outputs,
  className,
}: {
  outputs: PublicFactoryOutput[]
  className?: string
}) {
  if (outputs.length === 0) return null

  return (
    <section className={cn("mt-5 border-t border-stone-100 pt-4 dark:border-zinc-800", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-2 px-0.5">
        <h3 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">Community Studio outputs</h3>
        <span className="text-[11px] text-zinc-400">Visible to all users</span>
      </div>
      <ul className="space-y-0.5">
        {outputs.map((item) => (
          <li key={item.id}>
            <StudioOutputListRow
              kind={item.kind}
              title={item.title}
              meta={`${item.author} · ${item.createdAt}`}
              subtitle={item.excerpt}
              onClick={() =>
                toast.message(item.title, {
                  description: `${factoryKindShortLabel(item.kind)} · ${item.excerpt.slice(0, 100)}… (demo)`,
                })
              }
              onPlayClick={
                item.kind === "audio"
                  ? () =>
                      toast.message("Play audio", {
                        description: "Demo — community audio briefing.",
                      })
                  : undefined
              }
              onMenuClick={() =>
                toast.message("Actions", { description: "View, share, or report (demo)." })
              }
              trailing={
                <span className="mr-0.5 inline-flex items-center gap-0.5 text-[11px] text-zinc-400">
                  <Eye className="h-3 w-3" aria-hidden />
                  {item.viewCount.toLocaleString()}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

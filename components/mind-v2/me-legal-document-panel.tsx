"use client"

import { ChevronRight, Download } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import {
  getMainlandLegalDocument,
  type MainlandLegalDocId,
} from "@/lib/mainland-legal-docs"

export function MeLegalDocumentPanel({
  docId,
  onBack,
}: {
  docId: MainlandLegalDocId
  onBack: () => void
}) {
  const doc = getMainlandLegalDocument(docId)

  return (
    <div className="absolute inset-0 z-[56] flex flex-col bg-white animate-in slide-in-from-right duration-200 dark:bg-zinc-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-800 px-3 py-3 text-white dark:bg-zinc-900">
        <button type="button" onClick={onBack} className="rounded-full p-1 hover:bg-white/10" aria-label="Back">
          <ChevronRight className="h-6 w-6 rotate-180 text-white" />
        </button>
        <p className="min-w-0 flex-1 text-center text-[13px] font-semibold leading-snug">{doc.title}</p>
        <div className="w-8 shrink-0" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-700 bg-zinc-800/80 px-4 py-2 text-[11px] text-zinc-300">
        <span>Updated · {doc.lastUpdated}</span>
        <button
          type="button"
          onClick={() =>
            toast.success("Download started", {
              description: `${doc.title} PDF export is not available in this demo.`,
            })
          }
          className={cn("inline-flex items-center gap-1 font-medium text-mind/28")}
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{section.heading}</h2>
            <div className="mt-2 space-y-2">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
        <p className="pb-2 text-[11px] text-zinc-400">
          Operated by 璨辰科技（深圳）有限公司 · Mainland China entity disclosure
        </p>
      </div>
    </div>
  )
}

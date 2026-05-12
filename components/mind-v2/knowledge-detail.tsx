"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { SocialShareRow } from "@/components/mind-v2/social-share-row"
import { ContentFactoryModals, type FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import {
  ChevronLeft,
  Search,
  MoreHorizontal,
  Plus,
  Camera,
  Image,
  Mic,
  FolderOpen,
  Link2,
  FileText,
  FolderPlus,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Youtube,
} from "lucide-react"

type ShareTarget =
  | { scope: "library" }
  | { scope: "item"; title: string }

interface KnowledgeDetailProps {
  onBack: () => void
  onAgentChat?: (context: { kbName: string; contentTitle?: string }) => void
  knowledgeBase?: {
    name: string
    color: string
    description?: string
  }
  initialView?: "content" | "graph" | "factory"
}

const mockContents = [
  {
    id: 1,
    title: "Vector store architecture",
    excerpt:
      "Design notes on chunking, embeddings, and hybrid retrieval—when to use dense vs sparse, and how to keep citations stable across re-indexing.",
    source: "Note",
    author: "Tech weekly",
    date: "5/1",
    image: "https://picsum.photos/seed/1/80/80",
  },
  {
    id: 2,
    title: "How NotebookLM shifts AI workflows",
    excerpt:
      "Comparison of library-first Q&A vs ad-hoc chat: grounding, source cards, and why upload friction changes who adopts the tool.",
    source: "Web",
    author: "AI PM",
    date: "4/28",
    image: "https://picsum.photos/seed/2/80/80",
  },
  {
    id: 3,
    title: "OpenWiki: open knowledge tooling",
    excerpt:
      "Recording summary: community workflows for curating wikis, moderation, and linking out to primary literature without breaking context.",
    source: "Recording",
    author: "OSS",
    date: "4/25",
    image: "https://picsum.photos/seed/3/80/80",
  },
  {
    id: 4,
    title: "PaperOrchestra: multi-agent papers",
    excerpt:
      "PDF ingest pipeline: section detection, figure extraction, and agent roles for summarization vs critique in long documents.",
    source: "File",
    author: "X. B.",
    date: "5/1",
    image: "https://picsum.photos/seed/4/80/80",
  },
  {
    id: 5,
    title: "gpt-image-2 and slide decks",
    excerpt:
      "Market note on image models for slides—latency, rights, and when generated visuals help or hurt narrative clarity in decks.",
    source: "Web",
    author: "36Kr",
    date: "4/30",
    image: "https://picsum.photos/seed/5/80/80",
  },
]

function bodyForContent(id: number, title: string, excerpt: string): string[] {
  const common = [
    excerpt,
    "This entry is part of your notebook corpus. In production, the full text, attachments, and revision history would load here.",
    `Sections below expand on “${title}” with structured headings, pull quotes, and links back to the original capture or import.`,
  ]
  if (id === 1) {
    return [
      ...common,
      "Operational guidance: start with a single collection per project, version your embedding model explicitly, and log chunk boundaries so you can diff retrieval quality after changes.",
    ]
  }
  if (id === 3) {
    return [
      ...common,
      "From the recording: emphasize lightweight contribution flows—if publishing a note takes more than one step, most updates never leave private drafts.",
    ]
  }
  return common
}

/** NotebookLM-style grounded summary (mock copy). */
function notebookSummaryForLibrary(name: string, sourceCount: number): string {
  return `This library "${name}" auto-generates a summary from ${sourceCount} uploaded sources. It weaves transcripts, web clips, and document highlights into one readable thread: first the core takeaway from each source, then where they complement, repeat, or conflict—so you can build context before asking questions. The summary favors retrieval and stable citations—follow up on specific passages in chat for answers with source references.`
}

export function KnowledgeDetail({ onBack, onAgentChat, knowledgeBase, initialView = "content" }: KnowledgeDetailProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showNotebookAsk, setShowNotebookAsk] = useState(false)
  const [activeView, setActiveView] = useState<"content" | "graph" | "factory">(initialView)
  const [showContentDetail, setShowContentDetail] = useState<typeof mockContents[0] | null>(null)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)
  const sourceCount = mockContents.length
  const kbDisplayName = knowledgeBase?.name || "Notebook"
  const notebookSummaryBody = notebookSummaryForLibrary(kbDisplayName, sourceCount)

  const KbHeaderIcon = knowledgeBaseIconForTitle(
    knowledgeBase?.name ?? "",
    knowledgeBase?.description
  )

  const addMenuItems = [
    { icon: Camera, label: "Camera" },
    { icon: Image, label: "Image" },
    { icon: Mic, label: "Audio" },
    { icon: FolderOpen, label: "Local file" },
    { icon: Link2, label: "Link" },
    { icon: FileText, label: "Note", hasArrow: true },
    { icon: Youtube, label: "YouTube" },
    { icon: FolderPlus, label: "New folder" },
  ]

  const shareSheet = shareTarget && (
    <div className="absolute inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShareTarget(null)} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-200">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="px-5 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {shareTarget.scope === "library" ? "Share library" : "Share item"}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {shareTarget.scope === "library"
              ? knowledgeBase?.name || "Library"
              : shareTarget.title}
          </p>
        </div>
        <div className="px-5 pb-4">
          <SocialShareRow
            title={
              shareTarget.scope === "library"
                ? knowledgeBase?.name || "Library"
                : shareTarget.title
            }
            body={
              shareTarget.scope === "library"
                ? `Knowledge library: ${knowledgeBase?.name || "Library"}`
                : `From ${knowledgeBase?.name || "library"}: ${shareTarget.title}`
            }
            onAfterAction={() => setShareTarget(null)}
          />
        </div>
        <div className="px-5 pb-6">
          <button
            type="button"
            onClick={() => setShareTarget(null)}
            className="w-full py-3 bg-gray-100 rounded-xl text-gray-700 font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  if (showNotebookAsk) {
    return (
      <div className="relative flex h-full flex-col bg-[#faf7f6]">
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200/80 bg-[#faf7f6]/95 px-3 py-2.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setShowNotebookAsk(false)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-stone-200/60"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-zinc-800" />
          </button>
          <h1 className="min-w-0 flex-1 px-2 text-center text-[15px] font-semibold tracking-tight text-zinc-900 truncate">
            {kbDisplayName}
          </h1>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-stone-200/60"
            aria-label="More"
          >
            <MoreHorizontal className="h-5 w-5 text-zinc-600" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4">
          <h2 className="text-[20px] font-bold leading-snug tracking-tight text-zinc-900">
            {kbDisplayName} — library summary
          </h2>
          <p className="mt-2 text-[13px] text-zinc-500">{sourceCount} sources</p>

          <p className="mt-5 text-[15px] leading-[1.75] text-justify text-zinc-800">{notebookSummaryBody}</p>

          <div className="mt-5 flex items-center gap-1">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-stone-200/70 hover:text-zinc-800"
              aria-label="Copy summary"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-stone-200/70 hover:text-zinc-800"
              aria-label="Good summary"
            >
              <ThumbsUp className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-stone-200/70 hover:text-zinc-800"
              aria-label="Bad summary"
            >
              <ThumbsDown className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-full border border-stone-200/90 bg-white py-3 text-[15px] font-medium text-zinc-800 shadow-sm shadow-stone-900/5 transition-colors hover:bg-stone-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-violet-600">
                <path
                  d="M4 12h2l1.5-4 2 8 1.5-6H12l1 3 1-3h2l1.5 5 1.5-5H22"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Audio overview
          </button>
        </div>

        <div className="shrink-0 border-t border-stone-200/80 bg-[#faf7f6]/95 px-3 pb-3 pt-2 backdrop-blur-sm">
          <p className="mb-2 px-0.5 text-center text-[11px] leading-snug text-zinc-500">
            Mind may be wrong—verify important details.
          </p>
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="notebook-ask-sources">
              Ask sources
            </label>
            <input
              id="notebook-ask-sources"
              type="text"
              placeholder={`Ask ${sourceCount} sources…`}
              className="min-h-[44px] min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200/60"
            />
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-[13px] font-medium text-zinc-700 shadow-sm"
              aria-label="Sources"
            >
              <FileText className="h-4 w-4 text-zinc-500" />
              <span>{sourceCount}</span>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowNotebookAsk(false)
              onAgentChat?.({ kbName: kbDisplayName })
            }}
            className="mt-2 w-full rounded-xl border border-stone-200/90 bg-white py-2.5 text-[13px] font-medium text-zinc-600 hover:bg-stone-50"
          >
            Open conversational Q&A (Minder)
          </button>
        </div>
      </div>
    )
  }

  if (showContentDetail) {
    return (
      <div className="relative flex flex-col h-full bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={() => setShowContentDetail(null)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onAgentChat?.({ 
                kbName: knowledgeBase?.name || "Medrix Mind", 
                contentTitle: showContentDetail.title 
              })}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-zinc-500 to-stone-500 text-white rounded-full text-xs font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Mind Agent
            </button>
            <button
              type="button"
              onClick={() => setShareTarget({ scope: "item", title: showContentDetail.title })}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Share"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <img 
            src={showContentDetail.image} 
            alt="" 
            className="w-full h-48 rounded-xl object-cover bg-gray-100 mb-4"
          />
          <h1 className="text-xl font-bold text-gray-900 mb-3">{showContentDetail.title}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 mb-4">
            <span>{showContentDetail.source}</span>
            <span>·</span>
            <span>{showContentDetail.author}</span>
            <span>·</span>
            <span>{showContentDetail.date}</span>
          </div>
          <div className="space-y-4 text-[15px] leading-[1.7] text-gray-800">
            {bodyForContent(
              showContentDetail.id,
              showContentDetail.title,
              showContentDetail.excerpt
            ).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
        {shareSheet}
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
            
            {showAddMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {addMenuItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setShowAddMenu(false)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-[15px] text-gray-800">{item.label}</span>
                      <item.icon className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShareTarget({ scope: "library" })}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Share library"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
            knowledgeBase?.color || "from-zinc-400 to-stone-600"
          )}
        >
          <KbHeaderIcon className="w-6 h-6 text-white" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-semibold tracking-tight text-zinc-900 truncate">
            {knowledgeBase?.name || "Notebook"}
          </h1>
          <p className="text-[12px] text-zinc-500 truncate">
            {knowledgeBase?.description || "Grounded Q&A over your sources"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNotebookAsk(true)}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-zinc-500 text-white text-[11px] font-semibold hover:bg-zinc-600"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask
        </button>
      </div>

      <div className="px-4 py-2 bg-white border-b border-stone-100">
        <div className="flex gap-1 p-0.5 bg-stone-100 rounded-lg">
          {[
            { id: "content" as const, label: "Hub" },
            { id: "graph" as const, label: "Graph" },
            { id: "factory" as const, label: "Studio" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveView(mode.id)}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[12px] font-medium transition-all",
                activeView === mode.id
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("flex-1 flex flex-col min-h-0", activeView === "content" ? "overflow-hidden" : "overflow-y-auto")}>
        {activeView === "content" && (
          <div className="flex min-h-0 flex-1 flex-col bg-stone-50/80">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="px-4 pb-2 pt-3">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                All documents
              </h2>
              <div className="overflow-hidden rounded-xl border border-stone-200/90 bg-white">
                {mockContents.map((content) => (
                  <button
                    key={content.id}
                    type="button"
                    onClick={() => setShowContentDetail(content)}
                    className="flex w-full items-start gap-3 border-b border-stone-100 p-4 text-left last:border-b-0 hover:bg-stone-50/80"
                  >
                    <img
                      src={content.image}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg bg-stone-100 object-cover"
                    />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="text-[15px] font-medium leading-snug text-zinc-900">
                        {content.title}
                      </h3>
                      <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-zinc-600">
                        {content.excerpt}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-400">
                        <span className="text-zinc-600">{content.source}</span>
                        <span>|</span>
                        <span>{content.author}</span>
                        <span>|</span>
                        <span>{content.date}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            </div>
          </div>
        )}

        {activeView === "graph" && (
          <div className="h-full flex flex-col items-center justify-center px-5 py-8">
            <div className="relative w-64 h-64 mb-6">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-zinc-500 flex items-center justify-center text-white font-medium text-sm shadow-lg">
                Core
              </div>
              {[
                { x: 0, y: -80, label: "Concept A", color: "bg-zinc-400" },
                { x: 70, y: -40, label: "Project B", color: "bg-zinc-600" },
                { x: 70, y: 40, label: "Person C", color: "bg-stone-500" },
                { x: 0, y: 80, label: "Doc D", color: "bg-stone-600" },
                { x: -70, y: 40, label: "Idea E", color: "bg-zinc-500" },
                { x: -70, y: -40, label: "Asset F", color: "bg-stone-400" },
              ].map((node, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-14 h-14 rounded-full flex items-center justify-center text-white text-xs shadow-md",
                    node.color
                  )}
                  style={{
                    left: `calc(50% + ${node.x}px - 28px)`,
                    top: `calc(50% + ${node.y}px - 28px)`,
                  }}
                >
                  {node.label}
                </div>
              ))}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                {[
                  { x1: 128, y1: 128, x2: 128, y2: 48 },
                  { x1: 128, y1: 128, x2: 198, y2: 88 },
                  { x1: 128, y1: 128, x2: 198, y2: 168 },
                  { x1: 128, y1: 128, x2: 128, y2: 208 },
                  { x1: 128, y1: 128, x2: 58, y2: 168 },
                  { x1: 128, y1: 128, x2: 58, y2: 88 },
                ].map((line, i) => (
                  <line
                    key={i}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#E5E7EB"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Knowledge graph</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Visualize how ideas connect across your library.
            </p>
            <button className="px-6 py-2.5 bg-zinc-500 text-white rounded-xl text-sm font-medium hover:bg-zinc-600">
              Open full graph
            </button>
          </div>
        )}

        {activeView === "factory" && (
          <div className="px-5 py-4">
            <h3 className="font-medium text-gray-700 mb-4">Generate</h3>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setFactoryModal("report")}
                className="flex w-full items-center justify-between rounded-2xl bg-zinc-50/80 p-4 transition-colors hover:bg-zinc-100/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    <svg className="h-5 w-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M12 18v-6M9 15h6" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Report</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("audio")}
                className="flex w-full items-center justify-between rounded-2xl bg-zinc-50/80 p-4 transition-colors hover:bg-zinc-100/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    <svg className="h-5 w-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 10v3a1 1 0 001 1h3l4 4V3L6 7H3a1 1 0 00-1 1z" />
                      <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Audio brief</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("video")}
                className="flex w-full items-center justify-between rounded-2xl bg-zinc-50/80 p-4 transition-colors hover:bg-zinc-100/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    <svg className="h-5 w-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <polygon points="10 9 16 12 10 15 10 9" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Video brief</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("flashcards")}
                className="flex w-full items-center justify-between rounded-2xl bg-zinc-50/80 p-4 transition-colors hover:bg-zinc-100/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    <svg className="h-5 w-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="6" width="16" height="12" rx="2" />
                      <path d="M22 10v8a2 2 0 01-2 2H8" />
                      <path d="M8 10l3 3-3 3" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Flashcards</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("quiz")}
                className="flex w-full items-center justify-between rounded-2xl bg-zinc-50/80 p-4 transition-colors hover:bg-zinc-100/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    <svg className="h-5 w-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 9h.01M12 12a3 3 0 100-6 3 3 0 000 6zM9 15h6" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Quiz</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("infographic")}
                className="flex w-full items-center justify-between rounded-2xl bg-zinc-50/80 p-4 transition-colors hover:bg-zinc-100/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    <svg className="h-5 w-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Infographic</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => setFactoryModal("slides")}
                className="flex w-full items-center justify-between rounded-2xl bg-zinc-50/80 p-4 transition-colors hover:bg-zinc-100/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    <svg className="h-5 w-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Slides</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="mt-8 flex flex-col items-center text-center">
              <svg className="w-8 h-8 text-gray-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L3 9h7l2-7z" />
              </svg>
              <p className="text-sm text-gray-400">Studio outputs land here</p>
            </div>
          </div>
        )}
      </div>

      {shareSheet}

      <ContentFactoryModals
        open={factoryModal}
        onClose={() => setFactoryModal(null)}
        libraryName={kbDisplayName}
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronLeft, Play, Pause, Share2, MoreHorizontal, ThumbsUp, ThumbsDown, Maximize2, Sparkles, ChevronDown, Plus, BookOpen, X, Check, FolderPlus, Clock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DetailViewProps {
  onBack: () => void
}

// Transcript mock data
const transcriptSegments = [
  {
    time: "00:00:00",
    text: "Next, we walk through how to use Mind devices—from recording and marks to smart summaries, AI Q&A, and export—so you can get more done. With Mind Pro, Mind Pin S, or Mind Note, press and hold the device button for high-quality recording.",
  },
  {
    time: "00:00:35",
    text: "After pairing, you can also start recording in the Mind app. Where required by law, get consent from everyone being recorded. Respect privacy and follow applicable regulations.",
  },
  {
    time: "00:01:08",
    text: "During recording, Mind adds three multimodal inputs; each can produce a live AI summary so you can grasp and revisit key points in the conversation in real time.",
  },
  {
    time: "00:01:45",
    text: "On the CASK gene: it is an important X-linked gene tied to several neurodevelopmental disorders. trio-WES can help us quickly locate pathogenic variants.",
  },
]

// Notebook / workspace mock data
const notebooks = [
  { id: 1, name: "Medical research notes", workspace: "Clinical research", count: 23, recent: true },
  { id: 2, name: "Product requirements", workspace: "Work projects", count: 45, recent: true },
  { id: 3, name: "Study notes", workspace: "Personal growth", count: 12, recent: false },
  { id: 4, name: "Meeting minutes", workspace: "Work projects", count: 67, recent: true },
  { id: 5, name: "Technical design", workspace: "Work projects", count: 34, recent: false },
]

export function DetailView({ onBack }: DetailViewProps) {
  const [activeTab, setActiveTab] = useState<"source" | "note">("source")
  const [isPlaying, setIsPlaying] = useState(false)
  const [summaryType, setSummaryType] = useState("Summary")
  const [showSummaryDropdown, setShowSummaryDropdown] = useState(false)
  const [showNotebookSheet, setShowNotebookSheet] = useState(false)
  const [selectedNotebook, setSelectedNotebook] = useState<number | null>(null)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferComplete, setTransferComplete] = useState(false)

  const handleTransfer = () => {
    if (!selectedNotebook) return
    setIsTransferring(true)
    setTimeout(() => {
      setIsTransferring(false)
      setTransferComplete(true)
      setTimeout(() => {
        setShowNotebookSheet(false)
        setTransferComplete(false)
        setSelectedNotebook(null)
      }, 1500)
    }, 1200)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top bar */}
      <div className="pt-14 px-4 pb-2 bg-white">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          {/* Tabs */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("source")}
              className={cn(
                "text-base font-medium pb-1 border-b-2 transition-colors",
                activeTab === "source" ? "text-gray-900 border-gray-900" : "text-gray-400 border-transparent"
              )}
            >
              Source
            </button>
            <button
              onClick={() => setActiveTab("note")}
              className={cn(
                "text-base font-medium pb-1 border-b-2 transition-colors",
                activeTab === "note" ? "text-gray-900 border-gray-900" : "text-gray-400 border-transparent"
              )}
            >
              Note
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button className="w-10 h-10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "source" ? (
          /* Source / transcript */
          <div className="px-4">
            <div className="py-3 border-b border-gray-100">
              <span className="text-base font-medium text-gray-900 border-b-2 border-gray-900 pb-3">Transcript</span>
            </div>

            {/* Audio player */}
            <div className="py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-gray-700" />
                  ) : (
                    <Play className="w-5 h-5 text-gray-700 ml-0.5" />
                  )}
                </button>
                <span className="text-lg font-medium text-gray-900">00:04:28</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Maximize2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="py-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Transcript</span>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ThumbsUp className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ThumbsDown className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-6 pb-6">
              {transcriptSegments.map((segment, index) => (
                <div key={index}>
                  <div className="text-sm text-gray-400 mb-2">{segment.time}</div>
                  <p className="text-base text-gray-800 leading-relaxed">{segment.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Note view */
          <div className="px-4">
            <div className="py-3 flex items-center gap-4 border-b border-gray-100">
              <span className="text-base text-gray-500">Marks</span>
              <div className="relative">
                <button
                  onClick={() => setShowSummaryDropdown(!showSummaryDropdown)}
                  className="flex items-center gap-1 text-base text-gray-900 font-medium"
                >
                  {summaryType}
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {showSummaryDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-[100px]">
                    {["Summary", "Key points", "Outline", "Q&A"].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSummaryType(type)
                          setShowSummaryDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="py-4 text-center">
              <span className="text-sm text-gray-400">AI-generated content for reference only</span>
            </div>

            <div className="space-y-6 pb-6">
              <h1 className="text-2xl font-bold text-gray-900">How do I use a Mind device?</h1>

              <h2 className="text-xl font-bold text-gray-900">How do I use a Mind device?</h2>

              <p className="text-base text-gray-700 leading-relaxed">
                Here is how Mind fits into your flow—from recording and marks to summaries, AI Q&A, and export—so you can move faster with less friction.
              </p>

              <h2 className="text-xl font-bold text-gray-900 pt-4">How to record</h2>

              <p className="text-base text-gray-700 leading-relaxed">
                On Mind Pro, Mind Pin S, or Mind Note, press and hold the device button for high-quality capture.
              </p>

              <h2 className="text-xl font-bold text-gray-900 pt-4">Key terms</h2>

              <p className="text-base text-gray-700 leading-relaxed">
                This session mentions{" "}
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-sm font-medium">CASK</span>, an
                important X-linked gene linked to several neurodevelopmental disorders.{" "}
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-sm font-medium">trio-WES</span>{" "}
                can help locate pathogenic variants quickly.
              </p>

              <h2 className="text-xl font-bold text-gray-900 pt-4">Multimodal input</h2>

              <p className="text-base text-gray-700 leading-relaxed">
                Mind supports three multimodal inputs; each can stream a live AI summary so you can align on what matters
                while the conversation is still happening.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 space-y-3">
        <button
          onClick={() => setShowNotebookSheet(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all active:scale-[0.98]"
        >
          <BookOpen className="w-5 h-5" />
          Send to Notebook
          <ChevronRight className="w-4 h-4" />
        </button>

        {activeTab === "note" && (
          <div className="relative">
            <span className="absolute -top-2 left-3 px-1 bg-white text-xs text-gray-400">Beta</span>
            <input
              type="text"
              placeholder="Ask about this note"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base text-gray-700 placeholder-gray-400"
            />
          </div>
        )}
      </div>

      {showNotebookSheet && (
        <div className="absolute inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isTransferring && setShowNotebookSheet(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[75%] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Choose a Notebook</h3>
              <button
                onClick={() => !isTransferring && setShowNotebookSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-5 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Clock className="w-4 h-4" />
                <span>Recently used</span>
              </div>
              <div className="space-y-2">
                {notebooks
                  .filter((n) => n.recent)
                  .map((notebook) => (
                    <button
                      key={notebook.id}
                      onClick={() => setSelectedNotebook(notebook.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                        selectedNotebook === notebook.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{notebook.name}</div>
                        <div className="text-xs text-gray-500">
                          {notebook.workspace} · {notebook.count} items
                        </div>
                      </div>
                      {selectedNotebook === notebook.id && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="text-sm text-gray-500 mb-3">All Notebooks</div>
              <div className="space-y-2">
                {notebooks
                  .filter((n) => !n.recent)
                  .map((notebook) => (
                    <button
                      key={notebook.id}
                      onClick={() => setSelectedNotebook(notebook.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                        selectedNotebook === notebook.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{notebook.name}</div>
                        <div className="text-xs text-gray-500">
                          {notebook.workspace} · {notebook.count} items
                        </div>
                      </div>
                      {selectedNotebook === notebook.id && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
              </div>

              <button className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 mt-3 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-gray-500" />
                </div>
                <span className="font-medium text-gray-600">Create new Notebook</span>
              </button>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowNotebookSheet(false)}
                disabled={isTransferring}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={!selectedNotebook || isTransferring}
                className={cn(
                  "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                  selectedNotebook && !transferComplete
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : transferComplete
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-400"
                )}
              >
                {isTransferring ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : transferComplete ? (
                  <>
                    <Check className="w-5 h-5" />
                    Done
                  </>
                ) : (
                  "Confirm send"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

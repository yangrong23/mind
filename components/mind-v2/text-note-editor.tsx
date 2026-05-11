"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { SocialShareRow } from "@/components/mind-v2/social-share-row"
import { 
  ChevronLeft, MoreHorizontal, Undo2, Redo2, 
  ChevronRight, Globe, Mic, Plus, ChevronDown
} from "lucide-react"

interface TextNoteEditorProps {
  onBack: () => void
  note?: {
    id: number
    title: string
    preview: string
  }
}

export function TextNoteEditor({ onBack, note }: TextNoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.preview || "")
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)
  const [aiMessage, setAiMessage] = useState("")
  const [showAIModelSelect, setShowAIModelSelect] = useState(false)
  const [selectedAIModel, setSelectedAIModel] = useState("DS Fast")

  const aiModels = [
    { id: "ds-fast", name: "DS Fast", desc: "Fastest responses" },
    { id: "ds-pro", name: "DS Pro", desc: "Higher quality" },
    { id: "gpt4", name: "GPT-4", desc: "Strong all-around" },
    { id: "claude", name: "Claude", desc: "Long documents" },
  ]

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={onBack} className="p-1">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Undo2 className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Redo2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-2xl font-light text-gray-300 placeholder-gray-300 focus:text-gray-900 focus:outline-none mb-4"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Capture thoughts and ideas and turn them into clear notes."
          className="w-full h-[calc(100%-80px)] text-[17px] leading-relaxed text-gray-800 placeholder-gray-400 focus:outline-none resize-none"
        />
      </div>

      {/* Bottom AI composer */}
      <div className="border-t border-gray-100 bg-white">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
            <input
              type="text"
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              placeholder="Message or hold to speak"
              className="flex-1 bg-transparent text-[15px] placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-2">
            {/* Model picker */}
            <button 
              onClick={() => setShowAIModelSelect(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full"
            >
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{selectedAIModel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            
            {/* @ mention */}
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200">
              <span className="text-gray-600 text-sm font-medium">@</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Voice input */}
            <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200">
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* More / send */}
            <button 
              onClick={() => setShowShareSheet(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-900 bg-white"
            >
              <Plus className="w-5 h-5 text-gray-900" />
            </button>
          </div>
        </div>
      </div>

      {/* Model sheet */}
      {showAIModelSelect && (
        <div className="absolute inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAIModelSelect(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-5 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Choose AI model</h3>
            </div>
            <div className="px-5 pb-6 space-y-2">
              {aiModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedAIModel(model.name)
                    setShowAIModelSelect(false)
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors",
                    selectedAIModel === model.name 
                      ? "border-gray-900 bg-gray-50" 
                      : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-sm text-gray-500">{model.desc}</div>
                  </div>
                  {selectedAIModel === model.name && (
                    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share sheet */}
      {showShareSheet && (
        <div className="absolute inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowShareSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* Card preview */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <p className="flex-1 text-sm text-gray-600 line-clamp-2">
                  {content || "Capture your thoughts…"}
                </p>
              </div>
            </div>

            <div className="px-5 pb-2">
              <SocialShareRow
                title={title.trim() || "Note"}
                body={content.trim() || "Capture your thoughts…"}
              />
            </div>

            <div className="px-5 pb-4">
              <p className="text-xs text-gray-400 mb-2">Export</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                <button type="button" className="flex flex-col items-center gap-2 min-w-[64px]">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Long image</span>
                </button>
                <button type="button" className="flex flex-col items-center gap-2 min-w-[64px]">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Export PDF</span>
                </button>
              </div>
            </div>

            {/* Add to library */}
            <div className="px-5 pb-6">
              <h4 className="text-sm text-gray-400 mb-3">Add to library</h4>
              <div className="space-y-1">
                <div className="text-xs text-gray-400 px-1 pb-1">Personal</div>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-zinc-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span className="text-[15px] text-gray-900">My library</span>
                </button>
                
                <div className="text-xs text-gray-400 px-1 pt-3 pb-1">Shared</div>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-zinc-600 font-bold text-sm">M</span>
                  </div>
                  <span className="text-[15px] text-gray-900">Mind knowledge hub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

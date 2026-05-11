"use client"

import { useState } from "react"
import { Bluetooth, Mic, Camera, Type, Sparkles, MoreHorizontal, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface MemoCardProps {
  type: "recording" | "photo" | "voice"
  title: string
  time: string
  duration?: string
  tags: string[]
  preview?: string
  onClick?: () => void
}

function MemoCard({ type, title, time, duration, tags, preview, onClick }: MemoCardProps) {
  return (
    <div 
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {type === "recording" && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
          )}
          {type === "photo" && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
          )}
          {type === "voice" && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Type className="w-4 h-4 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 text-[15px]">{title}</h3>
            <p className="text-xs text-gray-400">{time} {duration && `· ${duration}`}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      {/* Waveform preview */}
      {type === "recording" && (
        <div className="h-12 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl mb-3 flex items-center px-3 overflow-hidden">
          <div className="flex items-center gap-[2px] h-full py-3">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i}
                className="w-[3px] bg-gradient-to-t from-blue-400 to-blue-500 rounded-full transition-all"
                style={{ 
                  height: `${Math.random() * 60 + 20}%`,
                  opacity: 0.6 + Math.random() * 0.4
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Image preview */}
      {type === "photo" && (
        <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3 overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
            Whiteboard preview
          </div>
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded-md">
            <span className="text-white text-[10px]">3 text regions detected</span>
          </div>
        </div>
      )}
      
      {/* Text preview */}
      {type === "voice" && preview && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{preview}</p>
      )}
      
      {/* Tags */}
      <div className="flex items-center gap-2">
        {tags.map((tag, i) => (
          <span 
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded-md"
          >
            <Sparkles className="w-3 h-3" />
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

interface MemoHomeProps {
  onStartRecording: () => void
  onCardClick: () => void
  onProfileClick: () => void
}

export function MemoHome({ onStartRecording, onCardClick, onProfileClick }: MemoHomeProps) {
  const [activeTab, setActiveTab] = useState<"all" | "recording" | "photo" | "voice">("all")
  
  return (
    <div className="h-full flex flex-col bg-[#f8f9fb]">
      {/* Top bar */}
      <div className="pt-14 px-5 pb-4 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Mind</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <Bluetooth className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Connected</span>
            </div>
            <button 
              onClick={onProfileClick}
              className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <User className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        
        {/* Filter chips */}
        <div className="flex gap-2">
          {[
            { id: "all", label: "All" },
            { id: "recording", label: "Recording" },
            { id: "photo", label: "Photo" },
            { id: "voice", label: "Voice" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <MemoCard
          type="recording"
          title="PRD review"
          time="Today 2:30 PM"
          duration="45:23"
          tags={["#product", "#requirements"]}
          onClick={onCardClick}
        />
        <MemoCard
          type="photo"
          title="Architecture whiteboard"
          time="Today 11:20 AM"
          tags={["#architecture", "#tech"]}
          onClick={onCardClick}
        />
        <MemoCard
          type="voice"
          title="Ideas scratchpad"
          time="Yesterday 10:15 PM"
          tags={["#ideas"]}
          preview="Research directions on CASK could combine with trio-WES analysis…"
          onClick={onCardClick}
        />
        <MemoCard
          type="recording"
          title="Clinical case discussion"
          time="Yesterday 9:00 AM"
          duration="1:23:45"
          tags={["#medicine", "#clinical"]}
          onClick={onCardClick}
        />
      </div>
      
      {/* Bottom record controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center">
        <div className="relative">
          {/* Left shortcut — camera */}
          <button className="absolute left-[-70px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center border border-gray-100 hover:scale-110 transition-transform">
            <Camera className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Primary record */}
          <button 
            onClick={onStartRecording}
            className="w-[72px] h-[72px] bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 hover:scale-105 transition-transform active:scale-95"
          >
            <Mic className="w-8 h-8 text-white" />
          </button>
          
          {/* Right shortcut — text */}
          <button className="absolute right-[-70px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center border border-gray-100 hover:scale-110 transition-transform">
            <Type className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

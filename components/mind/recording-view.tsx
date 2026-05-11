"use client"

import { useState, useEffect } from "react"
import { X, Bookmark, Pause, Square } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecordingViewProps {
  onStop: () => void
  onClose: () => void
}

// Mock live transcript segments
const transcriptSegments = [
  { text: "Okay, today we are going to discuss ", highlight: false },
  { text: "CASK", highlight: true, tooltip: "CASK: calcium/calmodulin-dependent serine protein kinase" },
  { text: " and its clinical phenotypes. ", highlight: false },
  { text: "First we need ", highlight: false },
  { text: "trio-WES", highlight: true, tooltip: "Trio whole-exome sequencing: WES on proband and both parents" },
  { text: " to confirm candidate variants. ", highlight: false },
  { text: "Then we can use an ", highlight: false },
  { text: "API", highlight: true, tooltip: "Application programming interface" },
  { text: " to plug into our analysis pipeline…", highlight: false },
]

export function RecordingView({ onStop, onClose }: RecordingViewProps) {
  const [time, setTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [visibleSegments, setVisibleSegments] = useState(0)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(60).fill(20))
  
  // Elapsed timer
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setTime(t => t + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isPaused])
  
  // Simulate streaming transcript
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setVisibleSegments(v => Math.min(v + 1, transcriptSegments.length))
    }, 1500)
    return () => clearInterval(timer)
  }, [isPaused])
  
  // Waveform animation
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setWaveHeights(prev => prev.map(() => Math.random() * 60 + 20))
    }, 100)
    return () => clearInterval(timer)
  }, [isPaused])
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  
  const addBookmark = () => {
    setBookmarks([...bookmarks, time])
  }
  
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <div className="pt-14 px-5 pb-4 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-medium">Recording</span>
        </div>
        <div className="w-10" />
      </div>
      
      {/* Timer */}
      <div className="text-center py-6">
        <div className="text-5xl font-light text-white tracking-wider font-mono">
          {formatTime(time)}
        </div>
        <p className="text-white/50 text-sm mt-2">Meeting capture</p>
      </div>
      
      {/* Waveform */}
      <div className="px-6 py-8">
        <div className="h-24 bg-white/5 rounded-2xl flex items-center justify-center px-4 overflow-hidden relative">
          {/* Bookmarks */}
          {bookmarks.map((bm, i) => (
            <div 
              key={i}
              className="absolute top-0 w-1 h-2 bg-yellow-400 rounded-b"
              style={{ left: `${(bm / Math.max(time, 1)) * 100}%` }}
            />
          ))}
          
          <div className="flex items-center gap-[3px] h-full py-4">
            {waveHeights.map((height, i) => (
              <div 
                key={i}
                className={cn(
                  "w-[4px] rounded-full transition-all duration-100",
                  i < waveHeights.length * 0.3 
                    ? "bg-gradient-to-t from-cyan-400 to-cyan-300"
                    : i < waveHeights.length * 0.6
                    ? "bg-gradient-to-t from-blue-400 to-blue-300"
                    : "bg-gradient-to-t from-purple-400 to-purple-300"
                )}
                style={{ 
                  height: isPaused ? "20%" : `${height}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Live transcript */}
      <div className="flex-1 mx-4 mb-4 bg-white/5 backdrop-blur rounded-2xl p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">AI transcribing live</span>
        </div>
        
        <div className="text-white/90 text-[15px] leading-relaxed">
          {transcriptSegments.slice(0, visibleSegments).map((seg, i) => (
            seg.highlight ? (
              <span 
                key={i}
                className="relative inline-block mx-1 px-2 py-0.5 bg-blue-500/30 text-blue-300 rounded cursor-pointer hover:bg-blue-500/50 transition-colors"
                onClick={() => setShowTooltip(showTooltip === seg.text ? null : seg.text)}
              >
                {seg.text}
                {showTooltip === seg.text && seg.tooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-xl text-gray-800 text-xs w-48 z-10">
                    <div className="font-semibold mb-1">{seg.text}</div>
                    <div className="text-gray-500">{seg.tooltip}</div>
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                  </div>
                )}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          ))}
          {visibleSegments < transcriptSegments.length && (
            <span className="inline-block w-2 h-5 bg-white/50 ml-1 animate-pulse" />
          )}
        </div>
      </div>
      
      {/* Bottom controls */}
      <div className="px-6 pb-10 flex items-center justify-center gap-6">
        <button 
          onClick={addBookmark}
          className="w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <Bookmark className="w-6 h-6 text-yellow-400" />
        </button>
        
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
        >
          {isPaused ? (
            <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-gray-800 ml-1" />
          ) : (
            <Pause className="w-7 h-7 text-gray-800" />
          )}
        </button>
        
        <button 
          onClick={onStop}
          className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <Square className="w-5 h-5 text-white fill-white" />
        </button>
      </div>
    </div>
  )
}

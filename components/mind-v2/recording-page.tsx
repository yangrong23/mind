"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { X, Pause, Bookmark, Mic, Square, Bluetooth, ChevronDown } from "lucide-react"

interface RecordingPageProps {
  onStop: () => void
  onClose: () => void
}

export function RecordingPage({ onStop, onClose }: RecordingPageProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0.2))
  const [isDeviceConnected] = useState(true)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setDuration(d => d + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isPaused])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setWaveformData(Array(50).fill(0).map(() => 0.15 + Math.random() * 0.85))
    }, 80)
    return () => clearInterval(timer)
  }, [isPaused])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const addBookmark = () => {
    setBookmarks([...bookmarks, duration])
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-teal-950 via-teal-900 to-teal-950">
      <div className="flex items-center justify-between px-5 py-4">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/25 rounded-full border border-teal-400/30">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-teal-100 text-sm font-medium">
            {isPaused ? "Paused" : "Recording"}
          </span>
        </div>
        
        <div className="w-10" />
      </div>

      <div className="px-5 mb-4">
        <div className={cn(
          "flex items-center justify-between p-3 rounded-xl",
          isDeviceConnected ? "bg-teal-500/15 border border-teal-400/20" : "bg-white/5"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isDeviceConnected ? "bg-teal-500" : "bg-zinc-600"
            )}>
              <Bluetooth className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-white">Mind Recorder</span>
                <span className="px-1.5 py-0.5 bg-teal-500 text-[10px] text-white rounded">
                  Connected
                </span>
              </div>
              <span className="text-xs text-white/50">85% · High-quality capture</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-white/50" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-6xl font-light text-white mb-2 font-mono tracking-wider">
          {formatTime(duration)}
        </div>
        <div className="text-sm text-teal-200/70 mb-10">
          {isPaused ? "Tap the mic to resume" : "Recording in progress…"}
        </div>

        <div className="w-full h-28 flex items-center justify-center gap-[3px] mb-10 px-2">
          {waveformData.map((height, i) => {
            const centerFactor = 1 - Math.abs(i - 25) / 30
            const adjustedHeight = height * (0.3 + centerFactor * 0.7)
            return (
              <div
                key={i}
                className="w-[3px] rounded-full transition-all duration-75"
                style={{ 
                  height: `${adjustedHeight * 100}%`,
                  minHeight: '4px',
                  opacity: isPaused ? 0.3 : 1,
                  background: `linear-gradient(to top, rgba(20, 184, 166, 0.95), rgba(103, 232, 249, 0.85))`
                }}
              />
            )
          })}
        </div>

        <div className="w-full bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-4 min-h-[100px] border border-teal-500/15">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-white/50">Live transcript</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            {duration < 3 && <span className="text-white/30">Waiting for speech…</span>}
            {duration >= 3 && duration < 8 && "Let’s walk through today’s product priorities…"}
            {duration >= 8 && duration < 15 && "Let’s walk through today’s product priorities. First, knowledge graph visualization—"}
            {duration >= 15 && duration < 22 && "Let’s walk through today’s product priorities. First, knowledge graph visualization—we need richer node types…"}
            {duration >= 22 && "Let’s walk through today’s product priorities. First, knowledge graph visualization—we need richer node types for people, orgs, and projects so users can see how ideas connect."}
          </p>
          {duration >= 10 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-1 bg-teal-500/25 text-teal-100 text-xs rounded-full border border-teal-400/25">
                Knowledge graph
              </span>
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-100 text-xs rounded-full border border-cyan-400/25">
                Product scope
              </span>
              {duration >= 20 && (
                <span className="px-2 py-1 bg-teal-400/20 text-teal-50 text-xs rounded-full border border-teal-300/25">
                  Node types
                </span>
              )}
            </div>
          )}
        </div>

        {bookmarks.length > 0 && (
          <div className="w-full">
            <div className="text-xs text-white/40 mb-2">Markers ({bookmarks.length})</div>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((time, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 bg-teal-500/20 text-teal-100 text-sm rounded-full border border-teal-400/30"
                >
                  {formatTime(time)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-10 pt-4">
        <p className="text-center text-white/40 text-xs mb-6">
          {isPaused ? "Recording paused — tap the mic to continue" : "Use pause or stop to finish"}
        </p>
        
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={addBookmark}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-white/50">Mark</span>
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex flex-col items-center gap-1"
          >
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
              isPaused 
                ? "bg-gradient-to-br from-teal-500 to-cyan-500 shadow-teal-500/35" 
                : "bg-white"
            )}>
              {isPaused ? (
                <Mic className="w-8 h-8 text-white" />
              ) : (
                <Pause className="w-8 h-8 text-teal-900" fill="currentColor" />
              )}
            </div>
            <span className="text-xs text-white/50">
              {isPaused ? "Resume" : "Pause"}
            </span>
          </button>

          <button
            onClick={onStop}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-14 h-14 rounded-full bg-teal-950 border-2 border-teal-400/60 flex items-center justify-center hover:bg-teal-900 transition-colors shadow-lg shadow-black/20">
              <Square className="w-5 h-5 text-teal-100" fill="currentColor" />
            </div>
            <span className="text-xs text-white/50">Stop</span>
          </button>
        </div>
      </div>
    </div>
  )
}

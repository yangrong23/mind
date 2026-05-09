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
      
      {/* 波形预览 */}
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
      
      {/* 图片预览 */}
      {type === "photo" && (
        <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3 overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
            白板内容预览
          </div>
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded-md">
            <span className="text-white text-[10px]">已识别 3 处文字</span>
          </div>
        </div>
      )}
      
      {/* 文字预览 */}
      {type === "voice" && preview && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{preview}</p>
      )}
      
      {/* 标签 */}
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
      {/* 顶部导航 */}
      <div className="pt-14 px-5 pb-4 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Mind</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <Bluetooth className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">已连接</span>
            </div>
            <button 
              onClick={onProfileClick}
              className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <User className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        
        {/* 筛选标签 */}
        <div className="flex gap-2">
          {[
            { id: "all", label: "全部" },
            { id: "recording", label: "录音" },
            { id: "photo", label: "拍照" },
            { id: "voice", label: "语音" },
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
      
      {/* 卡片列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <MemoCard
          type="recording"
          title="产品需求评审会议"
          time="今天 14:30"
          duration="45:23"
          tags={["#产品", "#需求"]}
          onClick={onCardClick}
        />
        <MemoCard
          type="photo"
          title="系统架构白板"
          time="今天 11:20"
          tags={["#架构", "#技术"]}
          onClick={onCardClick}
        />
        <MemoCard
          type="voice"
          title="灵感备忘"
          time="昨天 22:15"
          tags={["#灵感"]}
          preview="关于 CASK 基因的研究方向，可以考虑结合 trio-WES 分析方法..."
          onClick={onCardClick}
        />
        <MemoCard
          type="recording"
          title="临床病例讨论"
          time="昨天 09:00"
          duration="1:23:45"
          tags={["#医学", "#临床"]}
          onClick={onCardClick}
        />
      </div>
      
      {/* 底部录音按钮 */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center">
        <div className="relative">
          {/* 左侧��捷 - 相机 */}
          <button className="absolute left-[-70px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center border border-gray-100 hover:scale-110 transition-transform">
            <Camera className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* 主录音按钮 */}
          <button 
            onClick={onStartRecording}
            className="w-[72px] h-[72px] bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 hover:scale-105 transition-transform active:scale-95"
          >
            <Mic className="w-8 h-8 text-white" />
          </button>
          
          {/* 右侧快捷 - 文字 */}
          <button className="absolute right-[-70px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center border border-gray-100 hover:scale-110 transition-transform">
            <Type className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

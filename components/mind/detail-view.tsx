"use client"

import { useState } from "react"
import { ChevronLeft, Play, Pause, Share2, MoreHorizontal, ThumbsUp, ThumbsDown, Maximize2, Sparkles, ChevronDown, Plus, BookOpen, X, Check, FolderPlus, Clock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DetailViewProps {
  onBack: () => void
}

// 转写内容数据
const transcriptSegments = [
  {
    time: "00:00:00",
    text: "接下来，让我们一起详细了解如何使用 Mind 设备，从录音、标记，到智能总结、AI 问答和导出分享，全面提升您的生产力。如果您使用 Mind Pro、Mind Pin S，或者 Mind Note，只需长按设备上的按键，就能轻松完成高质量录音。"
  },
  {
    time: "00:00:35",
    text: "连接设备后，您也可以直接在 Mind App 里发起录音。如法律要求，请在录音前取得所有参与者的同意。请尊重隐私并遵守适用的法律法规。"
  },
  {
    time: "00:01:08",
    text: "Mind 在录音中还额外提供了三种多模态输入方式，每种都可生成实时 AI 总结，帮助您快速理解和回顾对话内容中的关键信息，与AI实时对齐重点。"
  },
  {
    time: "00:01:45",
    text: "关于 CASK 基因的讨论，这是一个位于 X 染色体上的重要基因，与多种神经发育障碍相关。trio-WES 分析可以帮助我们快速定位致病变异。"
  }
]

// Notebook/Workspace 数据
const notebooks = [
  { id: 1, name: "医学研究笔记", workspace: "临床研究", count: 23, recent: true },
  { id: 2, name: "产品需求文档", workspace: "工作项目", count: 45, recent: true },
  { id: 3, name: "学习笔记", workspace: "个人成长", count: 12, recent: false },
  { id: 4, name: "会议纪要", workspace: "工作项目", count: 67, recent: true },
  { id: 5, name: "技术方案", workspace: "工作项目", count: 34, recent: false },
]

export function DetailView({ onBack }: DetailViewProps) {
  const [activeTab, setActiveTab] = useState<"source" | "note">("source")
  const [isPlaying, setIsPlaying] = useState(false)
  const [summaryType, setSummaryType] = useState("总结")
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
      {/* 顶部导航栏 */}
      <div className="pt-14 px-4 pb-2 bg-white">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          {/* Tab 切换 */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab("source")}
              className={cn(
                "text-base font-medium pb-1 border-b-2 transition-colors",
                activeTab === "source" 
                  ? "text-gray-900 border-gray-900" 
                  : "text-gray-400 border-transparent"
              )}
            >
              来源
            </button>
            <button 
              onClick={() => setActiveTab("note")}
              className={cn(
                "text-base font-medium pb-1 border-b-2 transition-colors",
                activeTab === "note" 
                  ? "text-gray-900 border-gray-900" 
                  : "text-gray-400 border-transparent"
              )}
            >
              笔记
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
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "source" ? (
          /* 来源/转写视图 */
          <div className="px-4">
            {/* 转写标签 */}
            <div className="py-3 border-b border-gray-100">
              <span className="text-base font-medium text-gray-900 border-b-2 border-gray-900 pb-3">
                转写
              </span>
            </div>
            
            {/* 音频播放器 */}
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
            
            {/* 转写标题和反馈 */}
            <div className="py-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">转写</span>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ThumbsUp className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ThumbsDown className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* 转写内容 */}
            <div className="space-y-6 pb-6">
              {transcriptSegments.map((segment, index) => (
                <div key={index}>
                  <div className="text-sm text-gray-400 mb-2">{segment.time}</div>
                  <p className="text-base text-gray-800 leading-relaxed">
                    {segment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 笔记视图 */
          <div className="px-4">
            {/* 工具栏 */}
            <div className="py-3 flex items-center gap-4 border-b border-gray-100">
              <span className="text-base text-gray-500">标记</span>
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
                    {["总结", "要点", "大纲", "问答"].map((type) => (
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
            
            {/* AI 提示 */}
            <div className="py-4 text-center">
              <span className="text-sm text-gray-400">内容由 AI 生成，仅供参考</span>
            </div>
            
            {/* 笔记内容 */}
            <div className="space-y-6 pb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                如何使用 Mind 设备？
              </h1>
              
              <h2 className="text-xl font-bold text-gray-900">
                如何使用 Mind 设备？
              </h2>
              
              <p className="text-base text-gray-700 leading-relaxed">
                接下来，让我们一起详细了解如何使用 Mind，从录音、标记，到智能总结、AI 问答和导出分享，全面提升您的生产力。
              </p>
              
              <h2 className="text-xl font-bold text-gray-900 pt-4">
                如何录音
              </h2>
              
              <p className="text-base text-gray-700 leading-relaxed">
                如果您使用 Mind Pro、Mind Pin S，或者 Mind Note，只需长按设备上的按键，就能轻松完成高质量录音。
              </p>
              
              <h2 className="text-xl font-bold text-gray-900 pt-4">
                关键术语
              </h2>
              
              <p className="text-base text-gray-700 leading-relaxed">
                本次录音中提到了 <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-sm font-medium">CASK 基因</span>，这是一个位于 X 染色体上的重要基因，与多种神经发育障碍相关。通过 <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-sm font-medium">trio-WES</span> 分析可以帮助快速定位致病变异。
              </p>
              
              <h2 className="text-xl font-bold text-gray-900 pt-4">
                多模态输入
              </h2>
              
              <p className="text-base text-gray-700 leading-relaxed">
                Mind 提供了三种多模态输入方式，每种都可生成实时 AI 总结，帮助您快速理解和回顾对话内容中的关键信息。
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* 底部区域 */}
      <div className="p-4 bg-white border-t border-gray-100 space-y-3">
        {/* 流转至 Notebook 按钮 */}
        <button
          onClick={() => setShowNotebookSheet(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all active:scale-[0.98]"
        >
          <BookOpen className="w-5 h-5" />
          流转至 Notebook
          <ChevronRight className="w-4 h-4" />
        </button>
        
        {/* 提问输入框 - 仅在笔记视图显示 */}
        {activeTab === "note" && (
          <div className="relative">
            <span className="absolute -top-2 left-3 px-1 bg-white text-xs text-gray-400">Beta</span>
            <input
              type="text"
              placeholder="对此笔记提问"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base text-gray-700 placeholder-gray-400"
            />
          </div>
        )}
      </div>

      {/* Notebook 选择 Bottom Sheet */}
      {showNotebookSheet && (
        <div className="absolute inset-0 z-50">
          {/* 遮罩层 */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isTransferring && setShowNotebookSheet(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[75%] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* 拖动条 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* 标题栏 */}
            <div className="px-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">选择目标 Notebook</h3>
              <button 
                onClick={() => !isTransferring && setShowNotebookSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* 最近使用 */}
            <div className="px-5 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Clock className="w-4 h-4" />
                <span>最近使用</span>
              </div>
              <div className="space-y-2">
                {notebooks.filter(n => n.recent).map((notebook) => (
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
                      <div className="text-xs text-gray-500">{notebook.workspace} · {notebook.count} 条记录</div>
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
            
            {/* 全部 Notebook */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="text-sm text-gray-500 mb-3">全部 Notebook</div>
              <div className="space-y-2">
                {notebooks.filter(n => !n.recent).map((notebook) => (
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
                      <div className="text-xs text-gray-500">{notebook.workspace} · {notebook.count} 条记录</div>
                    </div>
                    {selectedNotebook === notebook.id && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* 创建新 Notebook */}
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 mt-3 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-gray-500" />
                </div>
                <span className="font-medium text-gray-600">创建新 Notebook</span>
              </button>
            </div>
            
            {/* 底部操作栏 */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowNotebookSheet(false)}
                disabled={isTransferring}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                取消
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
                    流转中...
                  </>
                ) : transferComplete ? (
                  <>
                    <Check className="w-5 h-5" />
                    已完成
                  </>
                ) : (
                  "确认流转"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

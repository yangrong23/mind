"use client"

import { useState } from "react"
import { 
  ChevronLeft, ChevronRight, Settings, Bell, Cloud, 
  Cpu, Zap, Brain, BookOpen, Sparkles, ToggleLeft, ToggleRight,
  Battery, Wifi, HardDrive, TrendingUp, GitBranch
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileViewProps {
  onBack: () => void
}

// 动态能量环组件
function EnergyRing({ capture, cognition, execution }: { capture: number; cognition: number; execution: number }) {
  const radius = 80
  const strokeWidth = 12
  const circumference = 2 * Math.PI * radius
  
  // 计算每个弧的长度
  const total = capture + cognition + execution
  const captureArc = (capture / 100) * circumference * 0.33
  const cognitionArc = (cognition / 100) * circumference * 0.33
  const executionArc = (execution / 100) * circumference * 0.33
  
  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* 背景环 */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        
        {/* 采集流 - 绿色 */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#greenGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${captureArc} ${circumference}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        
        {/* 认知流 - 蓝色 */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#blueGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${cognitionArc} ${circumference}`}
          strokeDashoffset={-captureArc - 10}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        
        {/* 执行流 - 紫色 */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#purpleGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${executionArc} ${circumference}`}
          strokeDashoffset={-captureArc - cognitionArc - 20}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        
        {/* 渐变定义 */}
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* 中心大脑图标 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-white rounded-full flex items-center justify-center shadow-inner">
          <Brain className="w-10 h-10 text-slate-600" />
        </div>
      </div>
      
      {/* 动态光晕效果 */}
      <div className="absolute inset-0 animate-pulse opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
      </div>
    </div>
  )
}

// 状态卡片组件
function StatusCard({ 
  icon: Icon, 
  title, 
  children,
  className 
}: { 
  icon: React.ElementType
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      "bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-100 shadow-sm",
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-[15px]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// 知识库开关项
function KnowledgeToggle({ 
  name, 
  status, 
  enabled,
  onToggle 
}: { 
  name: string
  status: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          enabled ? "bg-emerald-500" : "bg-gray-300"
        )} />
        <span className="text-sm text-gray-700">{name}</span>
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded",
          status === "启用" ? "bg-emerald-50 text-emerald-600" :
          status === "离线" ? "bg-gray-100 text-gray-500" :
          "bg-amber-50 text-amber-600"
        )}>
          {status}
        </span>
      </div>
      <button onClick={onToggle} className="transition-transform active:scale-95">
        {enabled ? (
          <ToggleRight className="w-6 h-6 text-emerald-500" />
        ) : (
          <ToggleLeft className="w-6 h-6 text-gray-300" />
        )}
      </button>
    </div>
  )
}

// 自动化规则卡片
function AutomationRule({ condition, action }: { condition: string; action: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded font-medium">IF</span>
          <span className="text-gray-600">{condition}</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1.5">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded font-medium">THEN</span>
          <span className="text-gray-600">{action}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  )
}

// 迷你图表组件
function MiniChart() {
  const data = [40, 65, 45, 80, 55, 90, 75]
  const max = Math.max(...data)
  
  return (
    <div className="h-16 flex items-end gap-1">
      {data.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500"
            style={{ height: `${(value / max) * 100}%` }}
          />
          <span className="text-[8px] text-gray-400">
            {["一", "二", "三", "四", "五", "六", "日"][i]}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ProfileView({ onBack }: ProfileViewProps) {
  const [knowledgeBases, setKnowledgeBases] = useState([
    { id: 1, name: "医学库", status: "启用", enabled: true },
    { id: 2, name: "代码库", status: "离线", enabled: false },
    { id: 3, name: "法律术语", status: "更新中", enabled: true },
  ])
  
  const toggleKnowledge = (id: number) => {
    setKnowledgeBases(prev => 
      prev.map(kb => kb.id === id ? { ...kb, enabled: !kb.enabled } : kb)
    )
  }
  
  return (
    <div className="h-full flex flex-col bg-[#f8f9fb]">
      {/* 顶部导航 */}
      <div className="pt-14 px-5 pb-4 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">智能状态</h1>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* 能量环仪表盘 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 shadow-sm">
          <EnergyRing capture={85} cognition={72} execution={45} />
          
          {/* 图例 */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <span className="text-xs text-gray-600">采集流</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
              <span className="text-xs text-gray-600">认知流</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-400" />
              <span className="text-xs text-gray-600">执行流</span>
            </div>
          </div>
          
          {/* AI 语录 */}
          <div className="mt-5 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 leading-relaxed">
                嘿，主人。今天你捕获了 <span className="font-semibold text-emerald-600">12 条</span> 医学案例，
                知识库已自动更新了 <span className="font-semibold text-blue-600">CASK 基因</span> 相关的 3 个新节点。
              </p>
            </div>
          </div>
        </div>
        
        {/* 存储与同步 */}
        <StatusCard icon={Cloud} title="云端大脑">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">存储空间</span>
                <span className="font-medium text-gray-700">1.2 GB / 100 GB</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[12%] bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              3 条高价值语音正在加密上传
            </div>
          </div>
        </StatusCard>
        
        {/* 专业增强状态 */}
        <StatusCard icon={BookOpen} title="专业知识库">
          <div className="divide-y divide-gray-50">
            {knowledgeBases.map(kb => (
              <KnowledgeToggle
                key={kb.id}
                name={kb.name}
                status={kb.status}
                enabled={kb.enabled}
                onToggle={() => toggleKnowledge(kb.id)}
              />
            ))}
          </div>
          <button className="w-full mt-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors">
            + 添加专业词库
          </button>
        </StatusCard>
        
        {/* 设备状态 */}
        <StatusCard icon={Cpu} title="Mind Link 设备">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <HardDrive className="w-8 h-8 text-slate-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">78%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">已连接</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                固件版本：v2.1.3 · 最新
              </div>
            </div>
          </div>
        </StatusCard>
        
        {/* 信息流转效率 */}
        <StatusCard icon={TrendingUp} title="灵感转化率">
          <div className="mb-3">
            <MiniChart />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">本周转化</span>
            <span className="font-semibold text-emerald-600">+23% 较上周</span>
          </div>
        </StatusCard>
        
        {/* 自动化中心 */}
        <StatusCard icon={GitBranch} title="自动化规则">
          <div className="space-y-2">
            <AutomationRule 
              condition="录音含 #案例" 
              action="同步至《临床笔记》" 
            />
            <AutomationRule 
              condition="识别到代码片段" 
              action="创建 GitHub Gist" 
            />
          </div>
          <button className="w-full mt-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-1">
            <Zap className="w-4 h-4" />
            创建新规则
          </button>
        </StatusCard>
        
        {/* 底部留白 */}
        <div className="h-8" />
      </div>
    </div>
  )
}

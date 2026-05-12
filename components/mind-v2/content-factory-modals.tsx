"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  X,
  Check,
  Pencil,
  FilePlus2,
  Sparkles,
  Wand2,
  Layers,
  HelpCircle,
  BarChart3,
  Presentation,
  Volume2,
  Video,
  ChevronDown,
} from "lucide-react"

export type FactoryModalKind =
  | "report"
  | "audio"
  | "video"
  | "flashcards"
  | "quiz"
  | "infographic"
  | "slides"

interface ContentFactoryModalsProps {
  open: FactoryModalKind | null
  onClose: () => void
  /** Shown in copy where library context matters */
  libraryName?: string
}

function ModalFrame({
  title,
  icon,
  children,
  onClose,
  footer,
}: {
  title: string
  icon: React.ReactNode
  children: ReactNode
  onClose: () => void
  footer?: React.ReactNode
}) {
  return (
    <div
      className="absolute inset-0 z-[70] flex flex-col justify-end bg-black/45 sm:items-center sm:justify-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full flex-col rounded-t-[1.25rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:mx-auto sm:max-h-[90vh] sm:max-w-[min(100%,28rem)] sm:rounded-2xl sm:shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200/90 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100/90 text-amber-800">
              {icon}
            </span>
            <h2 className="truncate text-[17px] font-semibold text-zinc-900">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-zinc-500 hover:bg-stone-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer}
      </div>
    </div>
  )
}

function GenerateFooter({ onGenerate, onClose }: { onGenerate: () => void; onClose: () => void }) {
  return (
    <div className="shrink-0 border-t border-stone-200/90 bg-white px-4 py-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            onGenerate()
            onClose()
          }}
          className="rounded-full bg-[#4A6CF7] px-6 py-2.5 text-[15px] font-semibold text-white shadow-sm hover:bg-[#3d5ee0]"
        >
          生成
        </button>
      </div>
    </div>
  )
}

function PillRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-[13px] text-zinc-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors",
                selected
                  ? "border-indigo-400 bg-indigo-50 text-indigo-900"
                  : "border-stone-200 bg-white text-zinc-700 hover:border-stone-300"
              )}
            >
              {selected && <Check className="h-3.5 w-3.5 shrink-0 text-indigo-600" strokeWidth={3} />}
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** 创建报告 — 格式 + 建议的格式 */
function ReportModal({ onClose }: { onClose: () => void }) {
  const formatCards = [
    { title: "自制格式", desc: "通过指定结构、风格、语气等方面，按照自己的方式制作报告" },
    { title: "简报文档", desc: "概述来源中的重要分析洞见和引文" },
    { title: "学习指南", desc: "简答题测验、推荐的论文问题以及关键术语词汇表" },
    { title: "博文", desc: "将洞见要点融汇成文，深入浅出，通俗易懂" },
  ]
  const suggestedCards = [
    { title: "行业白皮书", desc: "深度分析2025年AI驱动知识库的市场格局与选型逻辑。" },
    { title: "技术实施方案", desc: "详述从非结构化数据处理到RAG架构落地的完整路径。" },
    { title: "知识百科说明", desc: "系统性梳理个人与组织知识管理的核心概念与演进。" },
    { title: "学习专题综述", desc: "针对不同学习需求快速识别最适合的知识整理工具。" },
  ]
  const Card = ({ title, desc }: { title: string; desc: string }) => (
    <button
      type="button"
      className="relative flex w-full flex-col rounded-xl border border-stone-200/90 bg-[#faf8f5] p-3.5 text-left transition-colors hover:border-amber-200/80 hover:bg-[#f5f2ec]"
    >
      <span className="absolute right-2 top-2 rounded-md p-1 text-amber-700/80">
        <Pencil className="h-3.5 w-3.5" />
      </span>
      <span className="pr-7 text-[14px] font-semibold text-zinc-900">{title}</span>
      <span className="mt-1.5 text-[12px] leading-snug text-zinc-600">{desc}</span>
    </button>
  )
  return (
    <ModalFrame
      title="创建报告"
      icon={<FilePlus2 className="h-5 w-5" />}
      onClose={onClose}
      footer={<GenerateFooter onGenerate={() => {}} onClose={onClose} />}
    >
      <section className="mb-6">
        <h3 className="mb-3 text-[15px] font-semibold text-zinc-900">格式</h3>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
          {formatCards.map((c) => (
            <Card key={c.title} title={c.title} desc={c.desc} />
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-zinc-900">
          <Wand2 className="h-4 w-4 text-amber-700" />
          建议的格式
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {suggestedCards.map((c) => (
            <Card key={c.title} title={c.title} desc={c.desc} />
          ))}
        </div>
      </section>
    </ModalFrame>
  )
}

/** 自定义抽认卡 / 测验 — 卡片数量、难度、主题 */
function FlashcardsModal({ onClose }: { onClose: () => void }) {
  const [qty, setQty] = useState("standard")
  const [diff, setDiff] = useState("medium")
  const [topic, setTopic] = useState("")
  return (
    <ModalFrame
      title="自定义抽认卡"
      icon={<Layers className="h-5 w-5" />}
      onClose={onClose}
      footer={<GenerateFooter onGenerate={() => {}} onClose={onClose} />}
    >
      <PillRow
        label="卡片数量"
        value={qty}
        onChange={setQty}
        options={[
          { id: "few", label: "更少" },
          { id: "standard", label: "标准（默认）" },
          { id: "more", label: "更多" },
        ]}
      />
      <PillRow
        label="难度等级"
        value={diff}
        onChange={setDiff}
        options={[
          { id: "easy", label: "简单" },
          { id: "medium", label: "中等（默认）" },
          { id: "hard", label: "困难" },
        ]}
      />
      <div>
        <p className="mb-2 text-[13px] text-zinc-500">主题应该是什么？</p>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={8}
          placeholder={`示例提示\n• 抽认卡必须仅限于一个特定来源（例如「一篇介绍意大利的文章」）\n• 抽认卡必须专注于一个特定主题（例如「牛顿第二定律」）\n• 卡片正面内容必须简短易记（1–5 个字词）`}
          className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] leading-relaxed text-zinc-800 placeholder:text-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
        />
      </div>
    </ModalFrame>
  )
}

function QuizModal({ onClose }: { onClose: () => void }) {
  const [qty, setQty] = useState("standard")
  const [diff, setDiff] = useState("medium")
  const [topic, setTopic] = useState("")
  return (
    <ModalFrame
      title="自定义测验"
      icon={<HelpCircle className="h-5 w-5" />}
      onClose={onClose}
      footer={<GenerateFooter onGenerate={() => {}} onClose={onClose} />}
    >
      <PillRow
        label="问题数量"
        value={qty}
        onChange={setQty}
        options={[
          { id: "few", label: "更少" },
          { id: "standard", label: "标准（默认）" },
          { id: "more", label: "更多" },
        ]}
      />
      <PillRow
        label="难度等级"
        value={diff}
        onChange={setDiff}
        options={[
          { id: "easy", label: "简单" },
          { id: "medium", label: "中等（默认）" },
          { id: "hard", label: "困难" },
        ]}
      />
      <div>
        <p className="mb-2 text-[13px] text-zinc-500">主题应该是什么？</p>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={9}
          placeholder={`示例提示\n• 创建一份测验，帮助我为古埃及历史考试做准备\n• 测验必须包含 30 道题（最多允许 50 道题）\n• 测验必须仅限于一个特定来源（例如「一篇介绍意大利的文章」）\n• 测验必须只专注于重要的物理概念`}
          className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] leading-relaxed text-zinc-800 placeholder:text-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
        />
      </div>
    </ModalFrame>
  )
}

const infographicStyles = [
  { id: "auto", label: "自动选择", emoji: "✨" },
  { id: "cute", label: "可爱", emoji: "🚀" },
  { id: "clay", label: "泥塑风", emoji: "🧱" },
  { id: "sketch", label: "手绘笔记", emoji: "✏️" },
  { id: "anime", label: "动漫", emoji: "🎨" },
  { id: "editorial", label: "编辑风", emoji: "📰" },
]

function InfographicModal({ onClose }: { onClose: () => void }) {
  const [lang, setLang] = useState("English")
  const [orient, setOrient] = useState("landscape")
  const [style, setStyle] = useState("auto")
  const [detail, setDetail] = useState("standard")
  const [desc, setDesc] = useState("")
  return (
    <ModalFrame
      title="自定义信息图"
      icon={<BarChart3 className="h-5 w-5 text-violet-700" />}
      onClose={onClose}
      footer={<GenerateFooter onGenerate={() => {}} onClose={onClose} />}
    >
      <div className="mb-4">
        <p className="mb-1.5 text-[13px] text-zinc-500">选择语言</p>
        <div className="relative">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-3 pr-9 text-[14px] text-zinc-900 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
          >
            <option>English</option>
            <option>中文</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        </div>
      </div>
      <div className="mb-4">
        <p className="mb-2 text-[13px] text-zinc-500">选择屏幕方向</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "landscape", label: "横向" },
            { id: "portrait", label: "纵向" },
            { id: "square", label: "方形" },
          ].map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setOrient(o.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium",
                orient === o.id
                  ? "border-indigo-400 bg-indigo-50 text-indigo-900"
                  : "border-stone-200 bg-white text-zinc-700"
              )}
            >
              {orient === o.id && <Check className="h-3.5 w-3.5 text-indigo-600" strokeWidth={3} />}
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <p className="mb-2 text-[13px] text-zinc-500">选择视觉风格</p>
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {infographicStyles.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              className={cn(
                "flex w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-xl border p-2 text-center transition-colors",
                style === s.id ? "border-indigo-500 bg-indigo-50/80 ring-1 ring-indigo-200" : "border-stone-200 bg-[#faf8f5] hover:border-stone-300"
              )}
            >
              <span className="text-xl">{s.emoji}</span>
              <span className="text-[10px] font-medium leading-tight text-zinc-800">{s.label}</span>
              {style === s.id && <Check className="h-3 w-3 text-indigo-600" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>
      <PillRow
        label="详细程度"
        value={detail}
        onChange={setDetail}
        options={[
          { id: "short", label: "简短" },
          { id: "standard", label: "标准" },
          { id: "detailed", label: "详细 BETA" },
        ]}
      />
      <div>
        <p className="mb-2 text-[13px] text-zinc-500">描述您要创建的信息图</p>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          placeholder="指定风格、颜色或侧重点：「使用蓝色主题，并强调 3 个关键统计数据。」"
          className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
        />
      </div>
    </ModalFrame>
  )
}

function AudioModal({ onClose, libraryName }: { onClose: () => void; libraryName?: string }) {
  const [format, setFormat] = useState("deep")
  const [lang, setLang] = useState("English")
  const [duration, setDuration] = useState("default")
  const [focus, setFocus] = useState(
    "以企业知识管理系统为视角，阐述 RAG 技术如何解决传统搜索痛点。\n- 解释系统架构中知识构建与检索的关键流程。"
  )
  const formats = [
    { id: "deep", title: "深入探究", desc: "两位主持人之间生动有趣的对话，旨在解读和关联来源中的主题" },
    { id: "summary", title: "摘要", desc: "简短概要，旨在帮助您快速了解来源的核心思想" },
    { id: "review", title: "评论", desc: "对来源的专家评价，旨在提供建设性反馈，帮助您改进内容" },
    { id: "debate", title: "辩论", desc: "两位主持人之间思维缜密的辩论，旨在阐明对来源的不同观点" },
  ]
  const tags = ["管理软件对比", "企业架构实战", "新手选型指南"]
  return (
    <ModalFrame
      title="自定义音频概览"
      icon={<Volume2 className="h-5 w-5 text-sky-700" />}
      onClose={onClose}
      footer={<GenerateFooter onGenerate={() => {}} onClose={onClose} />}
    >
      <p className="mb-2 text-[13px] font-semibold text-zinc-900">格式</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {formats.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFormat(f.id)}
            className={cn(
              "relative flex flex-col rounded-xl border p-3 text-left text-[12px] leading-snug",
              format === f.id ? "border-indigo-400 bg-indigo-50/90" : "border-stone-200 bg-[#faf8f5] hover:border-stone-300"
            )}
          >
            {format === f.id && (
              <span className="absolute right-2 top-2 text-indigo-600">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
            )}
            <span className="pr-6 text-[13px] font-semibold text-zinc-900">{f.title}</span>
            <span className="mt-1 text-zinc-600">{f.desc}</span>
          </button>
        ))}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-[13px] text-zinc-500">选择语言</p>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full rounded-xl border border-stone-200 py-2 pl-2 pr-2 text-[13px]"
          >
            <option>English</option>
            <option>中文</option>
          </select>
        </div>
        <div>
          <p className="mb-2 text-[13px] text-zinc-500">时长</p>
          <div className="flex flex-wrap gap-1">
            {[
              { id: "short", label: "短" },
              { id: "default", label: "默认" },
              { id: "long", label: "长" },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setDuration(o.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1.5 text-[12px] font-medium",
                  duration === o.id ? "border-indigo-400 bg-indigo-50 text-indigo-900" : "border-stone-200 bg-white"
                )}
              >
                {duration === o.id && <Check className="mr-0.5 inline h-3 w-3" strokeWidth={3} />}
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className="mb-2 text-[13px] text-zinc-500">AI 主持人在本集节目中应着重于哪些方面？</p>
        <textarea
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          rows={5}
          className="mb-3 w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-[14px] text-zinc-800 focus:border-indigo-300 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFocus((prev) => (prev ? `${prev}\n` : "") + t)}
              className="rounded-full border border-dashed border-stone-300 bg-stone-50 px-3 py-1.5 text-[12px] text-zinc-700 hover:bg-stone-100"
            >
              + {t}
            </button>
          ))}
        </div>
      </div>
      {libraryName ? <p className="mt-3 text-[11px] text-zinc-400">来源知识库：{libraryName}</p> : null}
    </ModalFrame>
  )
}

function SlidesModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState("detailed")
  const [lang, setLang] = useState("English")
  const [duration, setDuration] = useState("default")
  const [desc, setDesc] = useState("")
  return (
    <ModalFrame
      title="自定义演示文稿"
      icon={<Presentation className="h-5 w-5 text-indigo-700" />}
      onClose={onClose}
      footer={<GenerateFooter onGenerate={() => {}} onClose={onClose} />}
    >
      <p className="mb-2 text-[13px] font-semibold text-zinc-900">格式</p>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("detailed")}
          className={cn(
            "relative flex flex-col rounded-xl border p-3 text-left",
            mode === "detailed" ? "border-indigo-400 bg-indigo-50/90" : "border-stone-200 bg-[#faf8f5]"
          )}
        >
          {mode === "detailed" && (
            <Check className="absolute right-2 top-2 h-4 w-4 text-indigo-600" strokeWidth={3} />
          )}
          <span className="pr-6 text-[13px] font-semibold text-zinc-900">详细演示文稿</span>
          <span className="mt-1 text-[12px] leading-snug text-zinc-600">
            一整套包含全文和详情的演示文稿，非常适合通过邮件发送或单独阅读。
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("slides")}
          className={cn(
            "relative flex flex-col rounded-xl border p-3 text-left",
            mode === "slides" ? "border-indigo-400 bg-indigo-50/90" : "border-stone-200 bg-[#faf8f5]"
          )}
        >
          {mode === "slides" && (
            <Check className="absolute right-2 top-2 h-4 w-4 text-indigo-600" strokeWidth={3} />
          )}
          <span className="pr-6 text-[13px] font-semibold text-zinc-900">演示用幻灯片</span>
          <span className="mt-1 text-[12px] leading-snug text-zinc-600">
            简洁直观的幻灯片，附带要介绍的重点，为您的演讲提供全程支持。
          </span>
        </button>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-[13px] text-zinc-500">选择语言</p>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full rounded-xl border border-stone-200 py-2 text-[13px]">
            <option>English</option>
            <option>中文</option>
          </select>
        </div>
        <div>
          <p className="mb-2 text-[13px] text-zinc-500">时长</p>
          <div className="flex gap-2">
            {[
              { id: "short", label: "短" },
              { id: "default", label: "默认" },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setDuration(o.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] font-medium",
                  duration === o.id ? "border-indigo-400 bg-indigo-50" : "border-stone-200 bg-white"
                )}
              >
                {duration === o.id && <Check className="mr-0.5 inline h-3 w-3" strokeWidth={3} />}
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className="mb-2 text-[13px] text-zinc-500">请描述您要创建的演示文稿</p>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={5}
          placeholder="添加一份概略提纲，或指定受众、风格和重点：「为新手用户创建一套演示文稿，采用大胆活泼的风格，注重分步说明。」"
          className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-[14px] placeholder:text-zinc-400 focus:border-indigo-300 focus:outline-none"
        />
      </div>
    </ModalFrame>
  )
}

/** 视频简报：与音频类似的结构，便于后续接不同模板 */
function VideoModal({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState("story")
  const [lang, setLang] = useState("中文")
  const [duration, setDuration] = useState("default")
  const [desc, setDesc] = useState("")
  const formats = [
    { id: "story", title: "叙事剪辑", desc: "按时间线串联来源要点，适合分享与复盘。" },
    { id: "explainer", title: "要点讲解", desc: "旁白式说明核心概念，突出数据与结论。" },
    { id: "interview", title: "对话导读", desc: "双视角问答结构，帮助听众建立框架。" },
    { id: "trailer", title: "精华预告", desc: "短时长高信息密度，适合作为系列开篇。" },
  ]
  return (
    <ModalFrame
      title="自定义视频简报"
      icon={<Video className="h-5 w-5 text-violet-700" />}
      onClose={onClose}
      footer={<GenerateFooter onGenerate={() => {}} onClose={onClose} />}
    >
      <p className="mb-2 text-[13px] font-semibold text-zinc-900">格式</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {formats.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFormat(f.id)}
            className={cn(
              "relative flex flex-col rounded-xl border p-3 text-left text-[12px] leading-snug",
              format === f.id ? "border-indigo-400 bg-indigo-50/90" : "border-stone-200 bg-[#faf8f5]"
            )}
          >
            {format === f.id && <Check className="absolute right-2 top-2 h-4 w-4 text-indigo-600" strokeWidth={3} />}
            <span className="pr-6 text-[13px] font-semibold text-zinc-900">{f.title}</span>
            <span className="mt-1 text-zinc-600">{f.desc}</span>
          </button>
        ))}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-[13px] text-zinc-500">选择语言</p>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full rounded-xl border border-stone-200 py-2 text-[13px]">
            <option>中文</option>
            <option>English</option>
          </select>
        </div>
        <div>
          <p className="mb-2 text-[13px] text-zinc-500">时长</p>
          <div className="flex flex-wrap gap-1">
            {[
              { id: "short", label: "短" },
              { id: "default", label: "默认" },
              { id: "long", label: "长" },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setDuration(o.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1.5 text-[12px] font-medium",
                  duration === o.id ? "border-indigo-400 bg-indigo-50" : "border-stone-200 bg-white"
                )}
              >
                {duration === o.id && <Check className="mr-0.5 inline h-3 w-3" strokeWidth={3} />}
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className="mb-2 text-[13px] text-zinc-500">希望视频侧重呈现哪些内容？</p>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          placeholder="例如：突出三条产品结论；片头 10 秒品牌露出；结尾附行动呼吁。"
          className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-[14px] focus:border-indigo-300 focus:outline-none"
        />
      </div>
    </ModalFrame>
  )
}

export function ContentFactoryModals({ open, onClose, libraryName }: ContentFactoryModalsProps) {
  if (!open) return null
  switch (open) {
    case "report":
      return <ReportModal onClose={onClose} />
    case "audio":
      return <AudioModal onClose={onClose} libraryName={libraryName} />
    case "video":
      return <VideoModal onClose={onClose} />
    case "flashcards":
      return <FlashcardsModal onClose={onClose} />
    case "quiz":
      return <QuizModal onClose={onClose} />
    case "infographic":
      return <InfographicModal onClose={onClose} />
    case "slides":
      return <SlidesModal onClose={onClose} />
    default:
      return null
  }
}

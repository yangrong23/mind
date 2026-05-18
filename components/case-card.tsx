"use client"

import { Microscope, BarChart3, FileText, Code, Stethoscope, Sparkles } from "lucide-react"

export type CaseCategory = "Single Cell" | "Graph Maker" | "Paper Write" | "Code" | "Clinical" | "General"

interface CaseCardProps {
  category: CaseCategory
  title: string
  description: string
  imagePosition: { row: number; col: number }
}

const categoryConfig: Record<CaseCategory, { icon: React.ReactNode; bgColor: string; textColor: string }> = {
  "Single Cell": {
    icon: <Microscope className="size-3.5" />,
    bgColor: "bg-mind/5",
    textColor: "text-mind/48",
  },
  "Graph Maker": {
    icon: <BarChart3 className="size-3.5" />,
    bgColor: "bg-mind/5",
    textColor: "text-mind",
  },
  "Paper Write": {
    icon: <FileText className="size-3.5" />,
    bgColor: "bg-mind/5",
    textColor: "text-mind/48",
  },
  "Code": {
    icon: <Code className="size-3.5" />,
    bgColor: "bg-stone-100",
    textColor: "text-stone-600",
  },
  "Clinical": {
    icon: <Stethoscope className="size-3.5" />,
    bgColor: "bg-red-50",
    textColor: "text-red-500",
  },
  "General": {
    icon: <Sparkles className="size-3.5" />,
    bgColor: "bg-mind/5",
    textColor: "text-mind/48",
  },
}

export function CaseCard({ category, title, description, imagePosition }: CaseCardProps) {
  const config = categoryConfig[category]
  
  // Calculate background position based on row and col (0-indexed)
  // Image is 3x3 grid, so each cell is 50% apart (0%, 50%, 100%)
  const bgPositionX = `${imagePosition.col * 50}%`
  const bgPositionY = `${imagePosition.row * 50}%`

  return (
    <div 
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl border border-zinc-100/80 h-[200px]"
      style={{
        backgroundImage: 'url(/images/card-backgrounds.png)',
        backgroundSize: '300% 300%',
        backgroundPosition: `${bgPositionX} ${bgPositionY}`,
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f9fafb',
      }}
    >
      {/* Light overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />
      
      <div className="relative p-5 h-full flex flex-col">
        {/* Category Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium w-fit ${config.bgColor} ${config.textColor}`}
        >
          {config.icon}
          <span>{category}</span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-[15px] font-semibold text-zinc-900 leading-snug line-clamp-2 max-w-[55%]">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-[13px] text-zinc-500 leading-relaxed line-clamp-2 max-w-[50%]">
          {description}
        </p>
      </div>
    </div>
  )
}

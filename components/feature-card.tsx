import Image from "next/image"
import { ArrowRight } from "lucide-react"

interface FeatureCardProps {
  category: string
  categoryColor: "green" | "gray"
  title: string
  subtitle: string
  imageSrc: string
}

export function FeatureCard({ category, categoryColor, title, subtitle, imageSrc }: FeatureCardProps) {
  const categoryStyles = {
    green: "bg-mind/5 text-mind border border-mind/18",
    gray: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  }

  const categoryIcons = {
    "Single Cell": (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
    "Code": (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  }

  return (
    <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-[380px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      
      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/30 to-transparent" style={{ height: '50%' }} />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Category Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${categoryStyles[categoryColor]}`}>
          {categoryIcons[category as keyof typeof categoryIcons]}
          <span>{category}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-zinc-900 mt-4 leading-tight max-w-[200px]">
          {title}
        </h3>
        
        {/* Subtitle */}
        <p className="text-sm text-zinc-500 mt-2 max-w-[220px]">
          {subtitle}
        </p>
      </div>
      
      {/* Arrow Button */}
      <div className="absolute bottom-5 right-5 z-10">
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-zinc-50 transition-colors">
          <ArrowRight className="w-5 h-5 text-zinc-700" />
        </button>
      </div>
    </div>
  )
}

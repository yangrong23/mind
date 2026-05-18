"use client"

import { useState } from "react"

const categories = [
  {
    id: "general",
    label: "General",
    subtitle: "Research, unleashed.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: "single-cell",
    label: "Single Cell",
    subtitle: "Every cell tells a story.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: "paper",
    label: "Paper",
    subtitle: "Your words, journal-ready.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: "graph",
    label: "Graph",
    subtitle: "Data that demands attention.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "clinical",
    label: "Clinical",
    subtitle: "Evidence at the speed of care.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M12 11v6" />
        <path d="M9 14h6" />
      </svg>
    ),
  },
]

interface CategoryTabsProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {categories.map((category) => {
        const isActive = activeCategory === category.id
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex flex-col items-center px-8 py-4 rounded-xl transition-all min-w-[140px]
              ${isActive 
                ? "bg-white border-2 border-mind/38 shadow-sm" 
                : "bg-transparent border-2 border-transparent hover:bg-white/50"
              }
            `}
          >
            <div className={`mb-2 ${isActive ? "text-mind" : "text-zinc-400"}`}>
              {category.icon}
            </div>
            <span className={`text-sm font-medium ${isActive ? "text-zinc-900" : "text-zinc-600"}`}>
              {category.label}
            </span>
            <span className="text-xs text-zinc-400 mt-1 text-center">
              {category.subtitle}
            </span>
          </button>
        )
      })}
    </div>
  )
}

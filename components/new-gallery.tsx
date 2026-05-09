"use client"

import { useState } from "react"
import { CategoryTabs } from "./category-tabs"
import { FeatureCard } from "./feature-card"

const cases = [
  {
    id: 1,
    category: "Single Cell",
    categoryColor: "green" as const,
    title: "Single-cell atlas of human lung development",
    subtitle: "Comprehensive single-cell analysis",
    imageSrc: "/images/lung-atlas.jpg",
    filterCategory: "single-cell",
  },
  {
    id: 2,
    category: "Code",
    categoryColor: "gray" as const,
    title: "Seurat to Scanpy migration",
    subtitle: "Bioinformatics pipeline conversion",
    imageSrc: "/images/seurat-scanpy.jpg",
    filterCategory: "single-cell",
  },
  {
    id: 3,
    category: "Single Cell",
    categoryColor: "green" as const,
    title: "Spatial transcriptomics workflow",
    subtitle: "Spatial data analysis pipeline",
    imageSrc: "/images/spatial-workflow.jpg",
    filterCategory: "single-cell",
  },
]

export function NewGallery() {
  const [activeCategory, setActiveCategory] = useState("single-cell")

  const getCategoryLabel = (id: string) => {
    const labels: Record<string, string> = {
      "general": "General",
      "single-cell": "Single Cell",
      "paper": "Paper",
      "graph": "Graph",
      "clinical": "Clinical",
    }
    return labels[id] || id
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Category Navigation */}
      <div className="py-8 px-4">
        <CategoryTabs 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </div>

      {/* Case Gallery Section */}
      <div className="px-8 py-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-wide">
            CASE GALLERY
          </h2>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            <span>Filtered by {getCategoryLabel(activeCategory)}</span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((caseItem) => (
            <FeatureCard
              key={caseItem.id}
              category={caseItem.category}
              categoryColor={caseItem.categoryColor}
              title={caseItem.title}
              subtitle={caseItem.subtitle}
              imageSrc={caseItem.imageSrc}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

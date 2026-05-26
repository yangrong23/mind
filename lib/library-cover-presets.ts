import type { LibraryCoverVariant } from "@/lib/product-media"

/** Preset tiles for create-library cover picker (3×3 grid: upload + 8 variants) */
export const LIBRARY_COVER_PRESETS: { id: string; variant: LibraryCoverVariant; label: string }[] = [
  { id: "product", variant: "product", label: "Product" },
  { id: "study", variant: "study", label: "Study" },
  { id: "reading", variant: "reading", label: "Reading" },
  { id: "engineering", variant: "engineering", label: "Engineering" },
  { id: "design", variant: "design", label: "Design" },
  { id: "research", variant: "research", label: "Research" },
  { id: "education", variant: "education", label: "Education" },
  { id: "tech", variant: "tech", label: "Tech" },
]

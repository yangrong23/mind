export const RESOURCE_COVER_KINDS = [
  "templates",
  "reports",
  "study",
  "cases",
  "devdocs",
  "community",
] as const

export type ResourceCoverKind = (typeof RESOURCE_COVER_KINDS)[number]

export function resourceCoverKind(index: number): ResourceCoverKind {
  return RESOURCE_COVER_KINDS[index % RESOURCE_COVER_KINDS.length] ?? "templates"
}

export const FLOW_PLATFORM_KINDS = ["web", "library", "agent", "studio", "team"] as const
export type FlowPlatformKind = (typeof FLOW_PLATFORM_KINDS)[number]

export function flowPlatformKind(index: number): FlowPlatformKind {
  return FLOW_PLATFORM_KINDS[index % FLOW_PLATFORM_KINDS.length] ?? "web"
}

/** Real photography for landing — category-matched, no abstract icons */
export const LANDING_RESOURCE_PHOTOS: Record<
  ResourceCoverKind,
  { src: string; alt: string; objectPosition?: string }
> = {
  templates: {
    src: "/images/card-backgrounds.png",
    alt: "Library template layouts on a desk",
    objectPosition: "center 40%",
  },
  reports: {
    src: "/images/publication-figures.jpg",
    alt: "Industry report charts and publication figures",
    objectPosition: "center center",
  },
  study: {
    src: "/images/single-cell-atlas.jpg",
    alt: "Study materials and research atlas visualization",
    objectPosition: "center 35%",
  },
  cases: {
    src: "/images/clinical-trial.jpg",
    alt: "Clinical case study documentation",
    objectPosition: "center center",
  },
  devdocs: {
    src: "/images/seurat-scanpy.jpg",
    alt: "Developer documentation and analysis workflow",
    objectPosition: "center 30%",
  },
  community: {
    src: "/images/spatial-transcriptomics.jpg",
    alt: "Research community and collaborative science",
    objectPosition: "center center",
  },
}

export type CaptureFeatureVariant = "web" | "file" | "mobile"

/** Left column — capture feature cards (semantic match to labels) */
export const LANDING_CAPTURE_FEATURE_PHOTOS: Record<
  CaptureFeatureVariant,
  { src: string; alt: string; objectPosition?: string; label?: string }
> = {
  web: {
    src: "/images/systematic-review.jpg",
    alt: "Web pages and articles saved into your library",
    objectPosition: "center 45%",
    label: "Web clip",
  },
  file: {
    src: "/images/grant-proposal.jpg",
    alt: "PDF, Word, and office files ready to parse",
    objectPosition: "center 40%",
    label: "Documents",
  },
  mobile: {
    src: "/images/cards-new.png",
    alt: "Mindar case libraries on web and mobile",
    objectPosition: "left 18% center",
    label: "Any device",
  },
}

/** Right column — upload modal hero */
export const LANDING_CAPTURE_UPLOAD_PHOTO = {
  src: "/images/grant-proposal.jpg",
  alt: "Drag and drop PDFs and documents into your library",
  objectPosition: "center 42%",
}

/** Right column — library grid (one distinct scene per folder) */
export const LANDING_CAPTURE_LIBRARY_ITEMS = [
  {
    name: "Product research",
    src: "/images/figure-generation.jpg",
    alt: "Product research dashboards and charts",
    objectPosition: "center 50%",
  },
  {
    name: "Engineering",
    src: "/images/seurat-scanpy.jpg",
    alt: "Seurat to Scanpy engineering notebooks",
    objectPosition: "center center",
  },
  {
    name: "Study notes",
    src: "/images/lung-atlas.jpg",
    alt: "Single-cell atlas and study references",
    objectPosition: "left 30% center",
  },
  {
    name: "Design refs",
    src: "/images/publication-figures.jpg",
    alt: "Publication figures and visual layout references",
    objectPosition: "center 55%",
  },
] as const

/** Let knowledge flow — one photo per platform */
export const LANDING_FLOW_PLATFORM_PHOTOS: Record<
  FlowPlatformKind,
  { src: string; alt: string; objectPosition?: string }
> = {
  web: {
    src: "/images/systematic-review.jpg",
    alt: "Web app with libraries and chat in the browser",
    objectPosition: "center 35%",
  },
  library: {
    src: "/images/card-backgrounds.png",
    alt: "Knowledge library folders and sources",
    objectPosition: "center 40%",
  },
  agent: {
    src: "/images/spatial-workflow.jpg",
    alt: "Mindar AI grounded answers from your files",
    objectPosition: "center 30%",
  },
  studio: {
    src: "/images/publication-figures.jpg",
    alt: "Studio reports and slides from sources",
    objectPosition: "center center",
  },
  team: {
    src: "/images/clinical-trial.jpg",
    alt: "Team shared libraries and permissions",
    objectPosition: "center center",
  },
}

export const LANDING_HERO_CONTINUE_PHOTOS = [
  {
    src: "/images/systematic-review.jpg",
    alt: "Systematic review workspace",
    tag: "Research",
  },
  {
    src: "/images/grant-proposal.jpg",
    alt: "Grant proposal drafting",
    tag: "Strategy",
  },
  {
    src: "/images/methods-section.jpg",
    alt: "Methods and lab notes",
    tag: "Methods",
  },
] as const

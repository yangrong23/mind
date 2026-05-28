import type { PlazaLibraryRow } from "@/lib/mock-plaza-libraries"
import {
  LANDING_CAPTURE_LIBRARY_ITEMS,
  LANDING_RESOURCE_PHOTOS,
  type ResourceCoverKind,
} from "@/lib/landing-photo-assets"
import type { LibraryCoverVariant } from "@/lib/product-media"

export type PlazaDiscoverVisual =
  | { kind: "photo"; src: string; alt: string; objectPosition?: string }
  | { kind: "cover"; variant: LibraryCoverVariant; name: string }

const PHOTO_POOL = [
  ...Object.values(LANDING_RESOURCE_PHOTOS),
  ...LANDING_CAPTURE_LIBRARY_ITEMS.map((item) => ({
    src: item.src,
    alt: item.alt,
    objectPosition: item.objectPosition,
  })),
]

const KB_PHOTO_OVERRIDES: Partial<Record<number, (typeof PHOTO_POOL)[number]>> = {
  101: LANDING_RESOURCE_PHOTOS.study,
  102: LANDING_RESOURCE_PHOTOS.reports,
  103: LANDING_RESOURCE_PHOTOS.templates,
  104: LANDING_RESOURCE_PHOTOS.cases,
  105: LANDING_RESOURCE_PHOTOS.devdocs,
  106: LANDING_RESOURCE_PHOTOS.community,
  107: LANDING_RESOURCE_PHOTOS.reports,
  108: LANDING_RESOURCE_PHOTOS.devdocs,
  109: LANDING_RESOURCE_PHOTOS.cases,
  110: LANDING_RESOURCE_PHOTOS.study,
  111: LANDING_RESOURCE_PHOTOS.templates,
  112: LANDING_RESOURCE_PHOTOS.reports,
}

function photoForKbId(kbId: number) {
  return KB_PHOTO_OVERRIDES[kbId] ?? PHOTO_POOL[kbId % PHOTO_POOL.length]!
}

/** Stable photo thumbnail for plaza discover / list cards */
export function plazaDiscoverVisualForRow(
  row: Pick<PlazaLibraryRow, "kbId" | "title" | "description" | "coverVariant">
): PlazaDiscoverVisual {
  const photo = photoForKbId(row.kbId)
  return {
    kind: "photo",
    src: photo.src,
    alt: photo.alt || row.title,
    objectPosition: photo.objectPosition,
  }
}

export function resourceKindForPlazaRow(
  row: Pick<PlazaLibraryRow, "plazaCategories" | "kbId">
): ResourceCoverKind {
  const cats = row.plazaCategories
  if (cats.includes("education")) return "study"
  if (cats.includes("health")) return "cases"
  if (cats.includes("tech")) return "devdocs"
  if (cats.includes("finance") || cats.includes("workplace")) return "reports"
  return ["templates", "reports", "study", "cases", "devdocs", "community"][
    row.kbId % 6
  ] as ResourceCoverKind
}

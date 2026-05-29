import { MOCK_PLAZA_LIBRARIES, type PlazaLibraryRow } from "@/lib/mock-plaza-libraries"
import { plazaDiscoverVisualForRow } from "@/lib/plaza-discover-visual"
import { formatEngagementCount } from "@/lib/plaza-kb-engagement"
import { LANDING_WEB_APP_HREF } from "@/lib/mind-landing-copy"

export type LandingPlazaSlide = {
  id: number
  title: string
  description: string
  tagline: string
  subscribers: string
  sources: string
  imageSrc: string
  imageAlt: string
  objectPosition?: string
  href: string
}

function slideFromRow(row: PlazaLibraryRow): LandingPlazaSlide {
  const visual = plazaDiscoverVisualForRow(row)
  const imageSrc = visual.kind === "photo" ? visual.src : "/images/card-backgrounds.png"
  return {
    id: row.kbId,
    title: row.title,
    description: row.description,
    tagline: row.publicTagline ?? row.authorHandle,
    subscribers: formatEngagementCount(row.subscriberCount),
    sources: `${row.contentCount.toLocaleString("en-US")} sources`,
    imageSrc,
    imageAlt: visual.kind === "photo" ? visual.alt : row.title,
    objectPosition: visual.kind === "photo" ? visual.objectPosition : undefined,
    href: `${LANDING_WEB_APP_HREF}/plaza`,
  }
}

/** Featured public libraries for the landing carousel (6–8 items). */
export function getLandingPlazaCarouselSlides(max = 8): LandingPlazaSlide[] {
  const featured = MOCK_PLAZA_LIBRARIES.filter((r) => r.featured)
  const rest = MOCK_PLAZA_LIBRARIES.filter((r) => !r.featured)
  const ordered = [...featured, ...rest].slice(0, max)
  return ordered.map(slideFromRow)
}

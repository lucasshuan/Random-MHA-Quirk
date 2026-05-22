import {
  getEnglishQuirkForFusion,
  listEnglishQuirksForFusion,
} from '@/server/quirks/repository'

export interface FusionCatalogQuirk {
  id: string
  origin: string
  type: string
  range: string
  facets: string[]
  name: string
  description: string
}

function toFusionCatalogQuirk(quirk: Awaited<ReturnType<typeof listEnglishQuirksForFusion>>[number]): FusionCatalogQuirk {
  return {
    id: quirk.id,
    origin: quirk.origin,
    type: quirk.type,
    range: quirk.range,
    facets: quirk.facets,
    name: quirk.name,
    description: quirk.description,
  }
}

/** Loads English catalog from Supabase for fusion LLM prompts. */
export async function loadQuirksCatalog(): Promise<FusionCatalogQuirk[]> {
  const quirks = await listEnglishQuirksForFusion()
  return quirks.map(toFusionCatalogQuirk)
}

export async function getQuirkById(
  id: string,
): Promise<FusionCatalogQuirk | null> {
  const quirk = await getEnglishQuirkForFusion(id)
  return quirk ? toFusionCatalogQuirk(quirk) : null
}

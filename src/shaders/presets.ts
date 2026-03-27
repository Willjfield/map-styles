import type { PostprocessingPlugin } from '../postprocessing'

/**
 * Map style ids (`MAP_STYLES[].id`) that use the pixelate pass.
 * Memphis and any style not listed here get no pixelation.
 */
export const STYLE_IDS_WITH_PIXELATE = new Set<string>(['macos3'])

/** Every pass id registered in `createMapShaderPlugin` — used to toggle off unused passes */
export const KNOWN_PASS_IDS = ['pixelate'] as const

export type KnownPassId = (typeof KNOWN_PASS_IDS)[number]

export function getPostprocessingPreset(styleId: string): {
  enabledPassIds: readonly string[]
} {
  const enabledPassIds = STYLE_IDS_WITH_PIXELATE.has(styleId)
    ? (['pixelate'] as const)
    : ([] as const)
  return { enabledPassIds }
}

export function applyPostprocessingPreset(
  plugin: PostprocessingPlugin,
  styleId: string,
): void {
  const { enabledPassIds } = getPostprocessingPreset(styleId)
  for (const id of KNOWN_PASS_IDS) {
    if (enabledPassIds.includes(id)) {
      plugin.enablePass(id)
    } else {
      plugin.disablePass(id)
    }
  }
}

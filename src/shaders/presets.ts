import type { PostprocessingPlugin } from '../postprocessing'

/**
 * Which postprocessing pass ids are enabled per map style (`MAP_STYLES[].id`).
 * Pass ids must exist on `createMapShaderPlugin` (see KNOWN_PASS_IDS).
 */
export const STYLE_POSTPASSES: Readonly<Record<string, readonly string[]>> = {
  macos3: ['pixelate'],
  mackintosh: ['bloom'],
  memphis: [],
}

/** Every pass id registered in `createMapShaderPlugin` — used to toggle off unused passes */
export const KNOWN_PASS_IDS = ['pixelate', 'bloom'] as const

export type KnownPassId = (typeof KNOWN_PASS_IDS)[number]

export function getPostprocessingPreset(styleId: string): {
  enabledPassIds: readonly string[]
} {
  return {
    enabledPassIds: STYLE_POSTPASSES[styleId] ?? [],
  }
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

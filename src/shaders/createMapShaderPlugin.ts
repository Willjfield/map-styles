import { createPostprocessingPlugin } from '../postprocessing'
import type { PostprocessingPlugin } from '../postprocessing'

import { createBloomPass } from './bloom'
import { createPixelatePass } from './pixelate'
import { getPostprocessingPreset } from './presets'

/**
 * Builds one plugin with every registered custom pass; use `applyPostprocessingPreset`
 * when the map style changes to enable/disable passes.
 */
export function createMapShaderPlugin(initialStyleId: string): PostprocessingPlugin {
  const pixelatePass = createPixelatePass({
    blockSize: (ctx) => Math.max(ctx.width / 900, 1),
  })

  const bloomPass = createBloomPass({
    threshold: 0.8,
    knee: 1.25,
    intensity: 0,
    blurIterations: 4,
    spread: 1.15,
  })

  const customPasses = [pixelatePass, bloomPass]
  const preset = getPostprocessingPreset(initialStyleId)

  return createPostprocessingPlugin({
    customPasses,
    passes: customPasses.map((p) => ({
      id: p.id,
      enabled: preset.enabledPassIds.includes(p.id),
    })),
  })
}

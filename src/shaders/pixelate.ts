import { createShaderPass } from '../postprocessing'
import type { PassResizeContext, PostPass, UniformValue } from '../postprocessing'

import pixelateFragmentSource from './pixelate.frag?raw'

export const PIXELATE_PASS_ID = 'pixelate'

export type PixelateBlockSize =
  | number
  | ((ctx: { width: number; height: number }) => number)

export interface CreatePixelatePassOptions {
  /** Screen-space block size in CSS pixels; default scales with framebuffer width */
  blockSize?: PixelateBlockSize
  /** Initial uniforms merged with defaults */
  uniforms?: Record<string, UniformValue>
}

export function defaultPixelateBlockSize(ctx: {
  width: number
  height: number
}): number {
  return Math.max(ctx.width / 900, 1)
}

function resolveBlockSize(
  blockSize: PixelateBlockSize | undefined,
  ctx: { width: number; height: number },
): number {
  if (blockSize === undefined) {
    return defaultPixelateBlockSize(ctx)
  }
  if (typeof blockSize === 'function') {
    return Math.max(blockSize(ctx), 1)
  }
  return Math.max(blockSize, 1)
}

/**
 * Pixelate pass with automatic `u_resolution` / `u_blockSize` updates on resize.
 */
export function createPixelatePass(
  options: CreatePixelatePassOptions = {},
): PostPass {
  const { blockSize: blockSizeOpt, uniforms: extraUniforms } = options

  const base = createShaderPass({
    id: PIXELATE_PASS_ID,
    fragmentSource: pixelateFragmentSource,
    uniforms: {
      u_resolution: [1, 1],
      u_blockSize: 8,
      ...extraUniforms,
    },
  })

  return {
    ...base,
    resize(ctx: PassResizeContext) {
      const b = resolveBlockSize(blockSizeOpt, ctx)
      base.setUniform?.('u_resolution', [ctx.width, ctx.height])
      base.setUniform?.('u_blockSize', b)
      base.resize?.(ctx)
    },
  }
}

import { createFramebuffer, createTexture } from '../postprocessing/gl/framebuffer'
import { FullscreenQuad } from '../postprocessing/gl/fullscreenQuad'
import { createProgram } from '../postprocessing/gl/program'
import type { PostPass } from '../postprocessing'

import bloomBlurSource from './bloomBlur.frag?raw'
import bloomCompositeSource from './bloomComposite.frag?raw'
import bloomExtractSource from './bloomExtract.frag?raw'
import fullscreenVertSource from './fullscreen.vert?raw'

export const BLOOM_PASS_ID = 'bloom'

export interface CreateBloomPassOptions {
  id?: string
  threshold?: number
  knee?: number
  intensity?: number
  blurIterations?: number
  spread?: number
}

function setUniform1f(gl: WebGL2RenderingContext, program: WebGLProgram, name: string, value: number) {
  const loc = gl.getUniformLocation(program, name)
  if (loc) gl.uniform1f(loc, value)
}

function setUniform1i(gl: WebGL2RenderingContext, program: WebGLProgram, name: string, value: number) {
  const loc = gl.getUniformLocation(program, name)
  if (loc) gl.uniform1i(loc, value)
}

function setUniform2f(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
  x: number,
  y: number,
) {
  const loc = gl.getUniformLocation(program, name)
  if (loc) gl.uniform2f(loc, x, y)
}

/**
 * Multi-pass bloom: threshold → separable Gaussian blur (ping-pong) → additive composite.
 * Fragment sources live in `bloomExtract.frag`, `bloomBlur.frag`, `bloomComposite.frag`.
 */
export function createBloomPass(options: CreateBloomPassOptions = {}): PostPass {
  const id = options.id ?? BLOOM_PASS_ID
  const state = {
    threshold: options.threshold ?? 0.55,
    knee: options.knee ?? 0.22,
    intensity: options.intensity ?? 0.38,
    blurIterations: Math.max(1, Math.min(12, options.blurIterations ?? 4)),
    spread: options.spread ?? 1.0,
  }

  let quad: FullscreenQuad | null = null
  let progExtract: WebGLProgram | null = null
  let progBlur: WebGLProgram | null = null
  let progComposite: WebGLProgram | null = null
  let texA: WebGLTexture | null = null
  let texB: WebGLTexture | null = null
  let fboA: WebGLFramebuffer | null = null
  let fboB: WebGLFramebuffer | null = null
  let size = { width: 1, height: 1 }

  function ensureTargets(gl: WebGL2RenderingContext, w: number, h: number) {
    if (texA && size.width === w && size.height === h) {
      return
    }
    if (texA) {
      gl.deleteFramebuffer(fboA!)
      gl.deleteFramebuffer(fboB!)
      gl.deleteTexture(texA)
      gl.deleteTexture(texB)
    }
    size = { width: w, height: h }
    texA = createTexture(gl, size)
    texB = createTexture(gl, size)
    fboA = createFramebuffer(gl, texA)
    fboB = createFramebuffer(gl, texB)
  }

  function drawTo(gl: WebGL2RenderingContext, fbo: WebGLFramebuffer | null, w: number, h: number) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.viewport(0, 0, w, h)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
  }

  return {
    id,
    init({ gl }) {
      progExtract = createProgram(gl, fullscreenVertSource, bloomExtractSource)
      progBlur = createProgram(gl, fullscreenVertSource, bloomBlurSource)
      progComposite = createProgram(gl, fullscreenVertSource, bloomCompositeSource)
      quad = new FullscreenQuad(gl)
    },
    resize({ gl, width, height }) {
      ensureTargets(gl, width, height)
    },
    render({ gl, width, height, inputTexture, outputFramebuffer }) {
      if (!quad || !progExtract || !progBlur || !progComposite) {
        throw new Error(`Pass "${id}" is not initialized.`)
      }
      ensureTargets(gl, width, height)
      if (!texA || !texB || !fboA || !fboB) {
        throw new Error(`Pass "${id}" failed to allocate render targets.`)
      }
      const extractProg = progExtract
      const blurProg = progBlur
      const compositeProg = progComposite
      const fa = fboA
      const fb = fboB
      const tA = texA
      const tB = texB

      drawTo(gl, fa, width, height)
      gl.useProgram(extractProg)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, inputTexture)
      gl.uniform1i(gl.getUniformLocation(extractProg, 'u_input'), 0)
      setUniform1f(gl, extractProg, 'u_threshold', state.threshold)
      setUniform1f(gl, extractProg, 'u_knee', state.knee)
      quad.draw()

      let readTex = tA
      let writeFbo = fb
      let writeTex = tB
      gl.useProgram(blurProg)
      const locImage = gl.getUniformLocation(blurProg, 'u_image')
      const total = state.blurIterations * 2
      for (let i = 0; i < total; i++) {
        drawTo(gl, writeFbo, width, height)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, readTex)
        if (locImage) gl.uniform1i(locImage, 0)
        setUniform2f(gl, blurProg, 'u_texelSize', 1 / width, 1 / height)
        setUniform1i(gl, blurProg, 'u_horizontal', i % 2 === 0 ? 1 : 0)
        setUniform1f(gl, blurProg, 'u_spread', state.spread)
        quad.draw()
        const nextRead = writeTex
        const nextWriteFbo = writeFbo === fa ? fb : fa
        const nextWriteTex = writeTex === tA ? tB : tA
        readTex = nextRead
        writeFbo = nextWriteFbo
        writeTex = nextWriteTex
      }

      const bloomTex = readTex

      drawTo(gl, outputFramebuffer, width, height)
      gl.useProgram(compositeProg)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, inputTexture)
      gl.uniform1i(gl.getUniformLocation(compositeProg, 'u_scene'), 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, bloomTex)
      gl.uniform1i(gl.getUniformLocation(compositeProg, 'u_bloom'), 1)
      setUniform1f(gl, compositeProg, 'u_intensity', state.intensity)
      quad.draw()
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, null)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, null)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.useProgram(null)
    },
    setUniform(name, value) {
      if (name === 'u_threshold') {
        state.threshold = value as number
      } else if (name === 'u_knee') {
        state.knee = value as number
      } else if (name === 'u_intensity') {
        state.intensity = value as number
      } else if (name === 'u_spread') {
        state.spread = value as number
      } else if (name === 'blurIterations') {
        state.blurIterations = Math.max(1, Math.min(12, value as number))
      }
    },
    dispose({ gl }) {
      if (quad) {
        quad.dispose()
        quad = null
      }
      if (progExtract) {
        gl.deleteProgram(progExtract)
        progExtract = null
      }
      if (progBlur) {
        gl.deleteProgram(progBlur)
        progBlur = null
      }
      if (progComposite) {
        gl.deleteProgram(progComposite)
        progComposite = null
      }
      if (texA) {
        gl.deleteFramebuffer(fboA!)
        gl.deleteFramebuffer(fboB!)
        gl.deleteTexture(texA)
        gl.deleteTexture(texB)
        texA = null
        texB = null
        fboA = null
        fboB = null
      }
    },
  }
}

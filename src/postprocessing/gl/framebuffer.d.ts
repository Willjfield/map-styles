import type { Size } from "../types/internal";
export interface RenderTarget {
    texture: WebGLTexture;
    framebuffer: WebGLFramebuffer;
}
export declare function createTexture(gl: WebGL2RenderingContext, size: Size): WebGLTexture;
export declare function resizeTexture(gl: WebGL2RenderingContext, texture: WebGLTexture, size: Size): void;
export declare function createFramebuffer(gl: WebGL2RenderingContext, texture: WebGLTexture): WebGLFramebuffer;
export declare function createRenderTarget(gl: WebGL2RenderingContext, size: Size): RenderTarget;
export declare function disposeRenderTarget(gl: WebGL2RenderingContext, target: RenderTarget): void;

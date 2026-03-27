import type { PostPass } from "../types/public";
/**
 * Wraps a pass so `resize` updates a vec2 uniform (default `u_resolution`) from the canvas size.
 * Use for shader passes that sample with pixel stride (blur, FXAA, etc.).
 */
export declare function withResizeUniform(pass: PostPass, uniformName?: string): PostPass;

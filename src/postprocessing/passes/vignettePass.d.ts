import type { PostPass, UniformValue } from "../types/public";
export declare function createVignettePass(options?: {
    id?: string;
    uniforms?: Record<string, UniformValue>;
}): PostPass;

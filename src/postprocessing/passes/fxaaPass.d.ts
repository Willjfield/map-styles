import type { PostPass, UniformValue } from "../types/public";
export declare function createFxaaPass(options?: {
    id?: string;
    uniforms?: Record<string, UniformValue>;
}): PostPass;

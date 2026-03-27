import type { PostPass, UniformValue } from "../types/public";
export declare function createColorGradePass(options?: {
    id?: string;
    uniforms?: Record<string, UniformValue>;
}): PostPass;

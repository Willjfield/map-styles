import type { PostPass, PostPassId, UniformValue } from "./public";
export interface PassRecord {
    id: PostPassId;
    pass: PostPass;
    enabled: boolean;
    order: number;
}
export interface Size {
    width: number;
    height: number;
}
export interface ShaderPassState {
    uniforms: Map<string, UniformValue>;
}

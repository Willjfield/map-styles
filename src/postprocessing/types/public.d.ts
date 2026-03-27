export type PostPassId = string;
export type UniformValue = number | number[];
export interface PostPassContext {
    gl: WebGL2RenderingContext;
    width: number;
    height: number;
    inputTexture: WebGLTexture;
    outputFramebuffer: WebGLFramebuffer | null;
    timeMs: number;
}
export interface PassInitContext {
    gl: WebGL2RenderingContext;
    width: number;
    height: number;
}
export interface PassResizeContext {
    gl: WebGL2RenderingContext;
    width: number;
    height: number;
}
export interface PassDisposeContext {
    gl: WebGL2RenderingContext;
}
export interface PostPass {
    id: PostPassId;
    init?(ctx: PassInitContext): void;
    resize?(ctx: PassResizeContext): void;
    render(ctx: PostPassContext): void;
    dispose?(ctx: PassDisposeContext): void;
    setUniform?(name: string, value: UniformValue): void;
}
/** Factory that builds a pass instance (used by presets and `createMapShaderPlugin`). */
export type PostPassFactory = () => PostPass;
/** Which passes are enabled for a given app style / map key. */
export interface PostprocessingStylePreset {
    enabledPassIds: readonly PostPassId[];
}
export type UnknownStyleBehavior = "throw" | "disable-all";
export interface ApplyPostprocessingPresetOptions {
    styleId: string;
    knownPassIds: readonly PostPassId[];
    presets: Readonly<Record<string, PostprocessingStylePreset>>;
    /** When `styleId` is missing from `presets`. Default: `"throw"`. */
    onUnknownStyle?: UnknownStyleBehavior;
}
export interface PresetRegistryConfig<T extends string = string> {
    knownPassIds: readonly PostPassId[];
    presets: Readonly<Record<T, PostprocessingStylePreset>>;
    defaultOnUnknownStyle?: UnknownStyleBehavior;
}
export interface PresetRegistry<T extends string = string> {
    readonly knownPassIds: readonly PostPassId[];
    readonly presets: Readonly<Record<T, PostprocessingStylePreset>>;
    apply(plugin: PostprocessingPlugin, styleId: T, options?: {
        onUnknownStyle?: UnknownStyleBehavior;
    }): void;
}
export interface CreateMapShaderPluginOptions {
    initialStyleId: string;
    knownPassIds: readonly PostPassId[];
    presets: Readonly<Record<string, PostprocessingStylePreset>>;
    passFactories: Readonly<Record<string, PostPassFactory>>;
    pluginOptions?: Omit<CreatePluginOptions, "customPasses" | "passes">;
}
export interface ShaderPassDefinition {
    id: PostPassId;
    vertexSource?: string;
    fragmentSource: string;
    uniforms?: Record<string, UniformValue>;
    pingPong?: boolean;
}
export interface RegisteredPassOptions {
    enabled?: boolean;
    order?: number;
}
export interface CreatePluginOptions {
    enabled?: boolean;
    passes?: Array<{
        id: PostPassId;
        enabled?: boolean;
        uniforms?: Record<string, UniformValue>;
    }>;
    customPasses?: PostPass[];
    debug?: boolean;
}
export interface PassStat {
    id: PostPassId;
    enabled: boolean;
    order: number;
}
export interface PluginStats {
    enabled: boolean;
    frameMs: number;
    passes: PassStat[];
}
export interface PostprocessingPlugin {
    attach(map: MapLike): void;
    detach(): void;
    registerPass(pass: PostPass, options?: RegisteredPassOptions): void;
    unregisterPass(id: PostPassId): void;
    enablePass(id: PostPassId): void;
    disablePass(id: PostPassId): void;
    setUniform(passId: PostPassId, uniform: string, value: UniformValue): void;
    setPassOrder(idsInExecutionOrder: PostPassId[]): void;
    setEnabled(enabled: boolean): void;
    getStats(): PluginStats;
}
export interface MapLike {
    on(event: string, listener: (...args: unknown[]) => void): MapLike;
    off(event: string, listener: (...args: unknown[]) => void): MapLike;
    getCanvas(): HTMLCanvasElement;
    triggerRepaint(): void;
}

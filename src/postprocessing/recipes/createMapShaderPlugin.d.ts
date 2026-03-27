import type { CreateMapShaderPluginOptions, PostprocessingPlugin } from "../types/public";
/**
 * Builds a single `createPostprocessingPlugin` instance with every pass from `knownPassIds` / `passFactories`,
 * then applies the preset for `initialStyleId`.
 * Use with `applyPostprocessingPreset` or `createPresetRegistry` when the app style changes.
 */
export declare function createMapShaderPlugin(options: CreateMapShaderPluginOptions): PostprocessingPlugin;

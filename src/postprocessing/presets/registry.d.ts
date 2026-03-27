import type { ApplyPostprocessingPresetOptions, PostprocessingPlugin, PresetRegistry, PresetRegistryConfig } from "../types/public";
/**
 * Enables passes listed in `presets[styleId].enabledPassIds` and disables every other id in `knownPassIds`.
 * Extra ids in the preset that are not in `knownPassIds` are ignored.
 */
export declare function applyPostprocessingPreset(plugin: PostprocessingPlugin, options: ApplyPostprocessingPresetOptions): void;
/**
 * Bundles `knownPassIds` + `presets` so apps can call `registry.apply(plugin, styleId)` when the active style changes.
 */
export declare function createPresetRegistry<T extends string>(config: PresetRegistryConfig<T>): PresetRegistry<T>;

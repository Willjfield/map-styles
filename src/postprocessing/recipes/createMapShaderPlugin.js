import { createPostprocessingPlugin } from "../plugin/createPlugin";
/**
 * Builds a single `createPostprocessingPlugin` instance with every pass from `knownPassIds` / `passFactories`,
 * then applies the preset for `initialStyleId`.
 * Use with `applyPostprocessingPreset` or `createPresetRegistry` when the app style changes.
 */
export function createMapShaderPlugin(options) {
    const preset = options.presets[options.initialStyleId];
    if (!preset) {
        throw new Error(`createMapShaderPlugin: unknown initialStyleId "${options.initialStyleId}"`);
    }
    const enabledSet = new Set(preset.enabledPassIds);
    const customPasses = options.knownPassIds.map((id) => {
        const factory = options.passFactories[id];
        if (!factory) {
            throw new Error(`createMapShaderPlugin: missing passFactories["${id}"]`);
        }
        return factory();
    });
    const passes = options.knownPassIds.map((id) => ({
        id,
        enabled: enabledSet.has(id),
    }));
    return createPostprocessingPlugin({
        ...options.pluginOptions,
        customPasses,
        passes,
    });
}

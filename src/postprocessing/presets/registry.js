/**
 * Enables passes listed in `presets[styleId].enabledPassIds` and disables every other id in `knownPassIds`.
 * Extra ids in the preset that are not in `knownPassIds` are ignored.
 */
export function applyPostprocessingPreset(plugin, options) {
    const onUnknown = options.onUnknownStyle ?? "throw";
    const preset = options.presets[options.styleId];
    if (!preset) {
        if (onUnknown === "disable-all") {
            for (const id of options.knownPassIds) {
                plugin.disablePass(id);
            }
            return;
        }
        throw new Error(`Unknown postprocessing style id: ${options.styleId}`);
    }
    const enabled = new Set(preset.enabledPassIds);
    for (const id of options.knownPassIds) {
        if (enabled.has(id)) {
            plugin.enablePass(id);
        }
        else {
            plugin.disablePass(id);
        }
    }
}
/**
 * Bundles `knownPassIds` + `presets` so apps can call `registry.apply(plugin, styleId)` when the active style changes.
 */
export function createPresetRegistry(config) {
    return {
        knownPassIds: config.knownPassIds,
        presets: config.presets,
        apply(plugin, styleId, applyOptions) {
            const onUnknownStyle = applyOptions?.onUnknownStyle ?? config.defaultOnUnknownStyle ?? "throw";
            applyPostprocessingPreset(plugin, {
                styleId,
                knownPassIds: config.knownPassIds,
                presets: config.presets,
                onUnknownStyle,
            });
        },
    };
}

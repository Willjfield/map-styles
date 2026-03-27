import { createColorGradePass } from "./passes/colorGradePass";
import { createFxaaPass } from "./passes/fxaaPass";
import { createShaderPass } from "./passes/shaderPass";
import { createVignettePass } from "./passes/vignettePass";
import { createPostprocessingPlugin } from "./plugin/createPlugin";
import { applyPostprocessingPreset, createPresetRegistry } from "./presets/registry";
import { createMapShaderPlugin } from "./recipes/createMapShaderPlugin";
export { createPostprocessingPlugin, createShaderPass };
export { applyPostprocessingPreset, createPresetRegistry };
export { createMapShaderPlugin };
export { withResizeUniform } from "./passes/passUtils";
export declare const builtInPasses: {
    fxaa: typeof createFxaaPass;
    vignette: typeof createVignettePass;
    colorGrade: typeof createColorGradePass;
};
export { colorGradeFragmentSource, fxaaFragmentSource, vignetteFragmentSource, } from "./shaders/embedded";
export type { ApplyPostprocessingPresetOptions, CreateMapShaderPluginOptions, CreatePluginOptions, MapLike, PassDisposeContext, PassInitContext, PassResizeContext, PassStat, PluginStats, PostPass, PostPassContext, PostPassFactory, PostPassId, PostprocessingPlugin, PostprocessingStylePreset, PresetRegistry, PresetRegistryConfig, RegisteredPassOptions, ShaderPassDefinition, UnknownStyleBehavior, UniformValue, } from "./types/public";

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
export const builtInPasses = {
    fxaa: createFxaaPass,
    vignette: createVignettePass,
    colorGrade: createColorGradePass,
};
export { colorGradeFragmentSource, fxaaFragmentSource, vignetteFragmentSource, } from "./shaders/embedded";

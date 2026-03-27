import { fxaaFragmentSource } from "../shaders/embedded";
import { createShaderPass } from "./shaderPass";
export function createFxaaPass(options) {
    const pass = createShaderPass({
        id: options?.id ?? "fxaa",
        fragmentSource: fxaaFragmentSource,
        uniforms: {
            u_resolution: [1, 1],
            u_strength: 1,
            ...(options?.uniforms ?? {}),
        },
    });
    return {
        ...pass,
        resize(ctx) {
            pass.setUniform?.("u_resolution", [ctx.width, ctx.height]);
            pass.resize?.(ctx);
        },
    };
}

import { vignetteFragmentSource } from "../shaders/embedded";
import { createShaderPass } from "./shaderPass";
export function createVignettePass(options) {
    return createShaderPass({
        id: options?.id ?? "vignette",
        fragmentSource: vignetteFragmentSource,
        uniforms: {
            u_intensity: 0.45,
            u_roundness: 1.2,
            ...(options?.uniforms ?? {}),
        },
    });
}

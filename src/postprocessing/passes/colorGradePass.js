import { colorGradeFragmentSource } from "../shaders/embedded";
import { createShaderPass } from "./shaderPass";
export function createColorGradePass(options) {
    return createShaderPass({
        id: options?.id ?? "colorGrade",
        fragmentSource: colorGradeFragmentSource,
        uniforms: {
            u_exposure: 1.0,
            u_contrast: 1.06,
            u_saturation: 1.05,
            ...(options?.uniforms ?? {}),
        },
    });
}

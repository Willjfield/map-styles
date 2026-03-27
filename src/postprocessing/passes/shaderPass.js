import { FullscreenQuad } from "../gl/fullscreenQuad";
import { createProgram } from "../gl/program";
const DEFAULT_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;
out vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
function setUniform(gl, location, value) {
    if (typeof value === "number") {
        gl.uniform1f(location, value);
        return;
    }
    switch (value.length) {
        case 1:
            gl.uniform1fv(location, value);
            break;
        case 2:
            gl.uniform2fv(location, value);
            break;
        case 3:
            gl.uniform3fv(location, value);
            break;
        case 4:
            gl.uniform4fv(location, value);
            break;
        default: {
            throw new Error(`Unsupported uniform array length: ${value.length}`);
        }
    }
}
export function createShaderPass(definition) {
    let program = null;
    let quad = null;
    const state = {
        uniforms: new Map(Object.entries(definition.uniforms ?? {})),
    };
    return {
        id: definition.id,
        init({ gl }) {
            program = createProgram(gl, definition.vertexSource ?? DEFAULT_VERTEX_SHADER, definition.fragmentSource);
            quad = new FullscreenQuad(gl);
        },
        render({ gl, width, height, inputTexture, outputFramebuffer }) {
            if (!program || !quad) {
                throw new Error(`Pass "${definition.id}" has not been initialized.`);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);
            gl.viewport(0, 0, width, height);
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.useProgram(program);
            const inputLocation = gl.getUniformLocation(program, "u_input");
            if (inputLocation) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, inputTexture);
                gl.uniform1i(inputLocation, 0);
            }
            for (const [name, value] of state.uniforms.entries()) {
                const location = gl.getUniformLocation(program, name);
                if (!location) {
                    continue;
                }
                setUniform(gl, location, value);
            }
            quad.draw();
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.useProgram(null);
        },
        setUniform(name, value) {
            state.uniforms.set(name, value);
        },
        dispose({ gl }) {
            if (quad) {
                quad.dispose();
                quad = null;
            }
            if (program) {
                gl.deleteProgram(program);
                program = null;
            }
        },
    };
}

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error("Failed to create shader.");
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!ok) {
        const info = gl.getShaderInfoLog(shader) ?? "Unknown shader compile error.";
        gl.deleteShader(shader);
        throw new Error(info);
    }
    return shader;
}
export function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        throw new Error("Failed to create shader program.");
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    const ok = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!ok) {
        const info = gl.getProgramInfoLog(program) ?? "Unknown program link error.";
        gl.deleteProgram(program);
        throw new Error(info);
    }
    return program;
}

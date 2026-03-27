export function createTexture(gl, size) {
    const texture = gl.createTexture();
    if (!texture) {
        throw new Error("Failed to create texture.");
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.width, size.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}
export function resizeTexture(gl, texture, size) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.width, size.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
}
export function createFramebuffer(gl, texture) {
    const framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
        throw new Error("Failed to create framebuffer.");
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return framebuffer;
}
export function createRenderTarget(gl, size) {
    const texture = createTexture(gl, size);
    const framebuffer = createFramebuffer(gl, texture);
    return { texture, framebuffer };
}
export function disposeRenderTarget(gl, target) {
    gl.deleteFramebuffer(target.framebuffer);
    gl.deleteTexture(target.texture);
}
